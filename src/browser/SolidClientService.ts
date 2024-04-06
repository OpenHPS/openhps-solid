import { ISessionInfo, ISessionOptions, IStorage, Session } from '@inrupt/solid-client-authn-browser';
import { SolidProfileObject } from '../common';
import { SolidService, SolidDataServiceOptions, SolidSession, ISessionInternalInfo } from '../common/SolidService';
import {
    buildAuthenticatedFetch,
    loadOidcContextFromStorage,
    maybeBuildRpInitiatedLogout,
    IncomingRedirectResult,
} from '@inrupt/solid-client-authn-core';
import { getTokens } from '@inrupt/oidc-client-ext';
import IssuerConfigFetcher from './IssuerConfigFetcher';

export class SolidClientService extends SolidService {
    protected options: SolidClientServiceOptions;
    protected issuerConfigFetcher: IssuerConfigFetcher;

    constructor(options?: SolidClientServiceOptions) {
        super(options);
        this.options.autoLogin = this.options.autoLogin ?? false;

        this.once('build', this._initialize.bind(this));
    }

    get session(): SolidSession {
        return this._session;
    }

    protected set session(value: SolidSession) {
        this._session = value;
    }

    private _initialize(): Promise<void> {
        return new Promise((resolve) => {
            this.issuerConfigFetcher = new IssuerConfigFetcher(this.storageUtility);

            // Default session (local storage)
            this.handleLogin()
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    this.emit('error', err);
                    resolve(); // A login error should not break the build process
                })
                .finally(() => {
                    this.emitAsync('ready');
                });
        });
    }

    logout(session: SolidSession): Promise<void> {
        return new Promise((resolve, reject) => {
            session
                .logout()
                .then(() => {
                    this.session = undefined;
                    return this.storage.delete('currentSession');
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Login a Solid browser user
     * @param {string} oidcIssuer OpenID Issuer
     * @param {boolean} remember Remember the session
     * @returns {Promise<void>} Session promise
     */
    login(oidcIssuer: string = this.options.defaultOidcIssuer, remember: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            const session = this.createSession({
                insecureStorage: this.storage,
                secureStorage: this.storage,
            });
            // Set the current session or at least override it
            this.storage
                .set('currentSession', session.info.sessionId)
                .then(() => {
                    return session.login({
                        oidcIssuer,
                        clientName: this.options.clientName,
                        clientId: this.options.clientId,
                        clientSecret: this.options.clientSecret,
                        redirectUrl: this.options.redirectUrl ? this.options.redirectUrl : window.location.href,
                        handleRedirect: this.options.handleRedirect,
                    });
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    handleLogin(): Promise<SolidSession> {
        return new Promise((resolve, reject) => {
            let storedSessionData: ISessionInfo & ISessionInternalInfo = undefined;
            let session: SolidSession = undefined;
            let sessionId: string = undefined;

            // Get the current session if any
            this.storage
                .get('currentSession')
                .then((currentLocalSessionId) => {
                    if (currentLocalSessionId) {
                        // Ugly workaround for https://github.com/inrupt/solid-client-authn-js/issues/2095
                        const CURRENT_SESSION_KEY = 'solidClientAuthn:currentSession';
                        const currentGlobalSessionId = window.localStorage.getItem(CURRENT_SESSION_KEY);
                        if (currentGlobalSessionId && currentLocalSessionId !== currentGlobalSessionId) {
                            window.localStorage.setItem(CURRENT_SESSION_KEY, currentLocalSessionId);
                        }
                    }
                    if (!currentLocalSessionId) {
                        resolve(undefined); // No user logged in so no error
                        return;
                    }
                    sessionId = currentLocalSessionId;
                    // Check if we have some information stored about this session
                    return this.findSessionInfoById(currentLocalSessionId);
                })
                .then(async (data) => {
                    storedSessionData = data;
                    session = this.createSession({
                        sessionInfo: {
                            sessionId,
                            ...storedSessionData,
                        } as any,
                        insecureStorage: this.storage,
                        secureStorage: this.storage,
                    });
                    return this.handleRedirect(session);
                })
                .then(async (sessionInfo) => {
                    if (sessionInfo && sessionInfo.isLoggedIn) {
                        this.session = session;
                        await this.storage.set('currentSession', sessionInfo.sessionId);
                        const object = new SolidProfileObject(this.session.info.webId);
                        object.sessionId = this.session.info.sessionId;
                        return this.storeProfile(object);
                    } else {
                        // Session is not logged in
                        await this.storage.delete('currentSession');
                        reject(new Error(`Unable to log in to Solid Pod!`));
                    }
                })
                .then(() => {
                    this.emit('login', this.session);
                    resolve(this.session);
                })
                .catch(reject);
        });
    }

    protected async handleRedirect(session?: SolidSession): Promise<ISessionInfo> {
        try {
            const url = new URL(window.location.href);
            // Check if can process
            if (url.searchParams.get('code') === null && url.searchParams.get('state') === null) {
                if (!session) {
                    return undefined;
                }
                // First check if tokens in memory
                const tokensString = await this.storage.get(
                    `solidClientAuthenticationUser:${session.info.sessionId}:tokens`,
                );
                if (tokensString) {
                    const tokens = JSON.parse(tokensString);
                    const authFetch = await buildAuthenticatedFetch(fetch, tokens.accessToken, {
                        dpopKey: tokens.dpopKey,
                        refreshOptions: undefined,
                        eventEmitter: undefined,
                        expiresIn: tokens.expiresIn,
                    });
                    const sessionInfo = await this.findSessionInfoById(session.info.sessionId);
                    if (!sessionInfo) {
                        throw new Error(`Could not retrieve session: [${session.info.sessionId}].`);
                    }
                    const { issuerConfig } = await loadOidcContextFromStorage(
                        session.info.sessionId,
                        this.storageUtility,
                        this.issuerConfigFetcher,
                    );
                    return Object.assign(sessionInfo, {
                        fetch: authFetch,
                        getLogoutUrl: maybeBuildRpInitiatedLogout({
                            idTokenHint: tokens.idToken,
                            endSessionEndpoint: issuerConfig.endSessionEndpoint,
                        }),
                        expirationDate: tokens.expirationDate,
                    } as IncomingRedirectResult);
                }
                return session.handleIncomingRedirect(url.href);
            }
            // Get OAuth state
            const oauthState = url.searchParams.get('state');
            const storedSessionId = (await this.storageUtility.getForUser(oauthState, 'sessionId', {
                errorIfNull: true,
            })) as string;

            // Get stored data for session
            const {
                issuerConfig,
                codeVerifier,
                redirectUrl: storedRedirectIri,
                dpop: isDpop,
            } = await loadOidcContextFromStorage(storedSessionId, this.storageUtility, this.issuerConfigFetcher);
            const iss = url.searchParams.get('iss');
            if (typeof iss === 'string' && iss !== issuerConfig.issuer) {
                throw new Error(
                    `The value of the iss parameter (${iss}) does not match the issuer identifier of the authorization server (${issuerConfig.issuer}). See [rfc9207](https://www.rfc-editor.org/rfc/rfc9207.html#section-2.3-3.1.1)`,
                );
            }

            if (codeVerifier === undefined) {
                throw new Error(`The code verifier for session ${storedSessionId} is missing from storage.`);
            }

            if (storedRedirectIri === undefined) {
                throw new Error(`The redirect URL for session ${storedSessionId} is missing from storage.`);
            }

            const client = await this.clientRegistrar.getClient({ sessionId: storedSessionId }, issuerConfig);
            const tokenCreatedAt = Date.now();
            const tokens = await getTokens(
                issuerConfig,
                client as any,
                {
                    grantType: 'authorization_code',
                    code: url.searchParams.get('code') as string,
                    codeVerifier: codeVerifier,
                    redirectUrl: storedRedirectIri,
                },
                isDpop,
            );

            const expirationDate =
                typeof tokens.expiresIn === 'number' ? tokenCreatedAt + tokens.expiresIn * 1000 : undefined;
            await this.storage.set(
                `solidClientAuthenticationUser:${storedSessionId}:tokens`,
                JSON.stringify({
                    ...tokens,
                    expirationDate,
                }),
            );
            const authFetch = await buildAuthenticatedFetch(fetch, tokens.accessToken, {
                dpopKey: tokens.dpopKey,
                refreshOptions: undefined,
                eventEmitter: undefined,
                expiresIn: tokens.expiresIn,
            });
            await this.storageUtility.setForUser(
                storedSessionId,
                {
                    webId: tokens.webId,
                    isLoggedIn: 'true',
                },
                { secure: true },
            );

            const sessionInfo = await this.findSessionInfoById(storedSessionId);
            if (!sessionInfo) {
                throw new Error(`Could not retrieve session: [${storedSessionId}].`);
            }

            window.history.replaceState({}, document.title, storedRedirectIri);

            return Object.assign(sessionInfo, {
                fetch: authFetch,
                getLogoutUrl: maybeBuildRpInitiatedLogout({
                    idTokenHint: tokens.idToken,
                    endSessionEndpoint: issuerConfig.endSessionEndpoint,
                }),
                expirationDate,
            } as IncomingRedirectResult);
        } catch (error) {
            this.emit('error', error);
            return undefined;
        }
    }

    protected createSession(options: Partial<ISessionOptions>): Session {
        return new Session(options);
    }
}

export interface SolidClientServiceOptions extends SolidDataServiceOptions {
    /**
     * Auto login is not possible in browser
     */
    autoLogin?: false;
    /**
     * Automatically restore a previous session.
     * @default false
     */
    restorePreviousSession?: boolean;
    /**
     * Handle redirect URL. In a mobile app such as CapacitorJS you can use `@capacitor/browser` to open the URL.
     * @param redirectUrl
     * @returns
     */
    handleRedirect?: (redirectUrl: string) => void;
}

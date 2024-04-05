import { ISessionInfo, ISessionOptions, Session } from '@inrupt/solid-client-authn-browser';
import { SolidProfileObject } from '../common';
import { SolidService, SolidDataServiceOptions, SolidSession, ISessionInternalInfo } from '../common/SolidService';

export class SolidClientService extends SolidService {
    protected options: SolidClientServiceOptions;

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
        return new Promise((resolve, reject) => {
            // Default session (local storage)
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
                        resolve();
                        return;
                    }
                    return this.handleLogin(currentLocalSessionId);
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    this.emit('error', err);
                    resolve(); // A login error should not break the build process
                }).finally(() => {
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

    protected handleLogin(sessionId: string): Promise<SolidSession> {
        return new Promise((resolve, reject) => {
            let storedSessionData: ISessionInfo & ISessionInternalInfo = undefined;
            let session: SolidSession = undefined;
            // Check if we have some information stored about this session
            this.findSessionInfoById(sessionId)
                .then((data) => {
                    storedSessionData = data;
                    session = this.createSession({
                        sessionInfo: {
                            sessionId,
                            ...storedSessionData,
                        } as any,
                        insecureStorage: this.storage,
                        secureStorage: this.storage,
                    });
                    // Check if the stored session data can be used to do a silent login
                    return session.handleIncomingRedirect({
                        url: new URL(window.location.href).toString(),
                        restorePreviousSession: this.options.restorePreviousSession,
                    });
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

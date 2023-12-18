import { getDefaultSession, ISessionOptions, Session } from '@inrupt/solid-client-authn-browser';
import { SolidProfileObject } from '../common';
import { SolidService, SolidDataServiceOptions, SolidSession } from '../common/SolidService';

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
        if (value && value.info.isLoggedIn) {
            this.set('currentSession', value.info.sessionId);
        } else {
            this.delete('currentSession');
        }
        this._session = value;
    }

    private _initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.options.autoLogin) {
                this.login(this.options.defaultOidcIssuer)
                    .then(() => resolve())
                    .catch(reject);
            } else {
                const session = new Session({
                    insecureStorage: this,
                    secureStorage: this,
                });
                // Default session (local storage)
                this.get('currentSession')
                    .then((currentLocalSessionId) => {
                        if (currentLocalSessionId) {
                            // Ugly workaround for https://github.com/inrupt/solid-client-authn-js/issues/2095
                            const CURRENT_SESSION_KEY = 'solidClientAuthn:currentSession';
                            const currentGlobalSessionId = window.localStorage.getItem(CURRENT_SESSION_KEY);
                            if (currentGlobalSessionId && currentLocalSessionId !== currentGlobalSessionId) {
                                window.localStorage.setItem(CURRENT_SESSION_KEY, currentLocalSessionId);
                            }
                        }
                        return this.onRedirect(session, new URL(window.location.href));
                    })
                    .then(() => resolve())
                    .catch(() => {
                        const currentGlobalSession = getDefaultSession();
                        if (currentGlobalSession && currentGlobalSession.info.isLoggedIn) {
                            this.session = currentGlobalSession;
                            this.emitAsync('login', this.session);
                        }
                        resolve();
                    });
            }
        });
    }

    logout(session: Session): Promise<void> {
        return new Promise((resolve, reject) => {
            session
                .logout()
                .then(() => {
                    this.session = undefined;
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Login a Solid browser user
     * @param {string} oidcIssuer OpenID Issuer
     * @returns {Promise<Session>} Session promise
     */
    login(oidcIssuer: string = this.options.defaultOidcIssuer): Promise<Session> {
        return new Promise((resolve, reject) => {
            const session = new Session({
                insecureStorage: this,
                secureStorage: this,
            });
            session
                .login({
                    oidcIssuer,
                    clientName: this.options.clientName,
                    clientId: this.options.clientId,
                    clientSecret: this.options.clientSecret,
                    redirectUrl: this.options.redirectUrl ? this.options.redirectUrl : window.location.href,
                    handleRedirect: this.options.handleRedirect,
                })
                .then(() => {
                    this.session = session;
                    return this.get(`solidClientAuthenticationUser:${session.info.sessionId}`);
                })
                .then((data) => {
                    const sessionData = JSON.parse(data);
                    sessionData.webId = session.info.webId;
                    sessionData.issuer = oidcIssuer;
                    return this.set(
                        `solidClientAuthenticationUser:${session.info.sessionId}`,
                        JSON.stringify(sessionData),
                    );
                })
                .then(() => {
                    const object = new SolidProfileObject(session.info.webId);
                    object.sessionId = session.info.sessionId;
                    return Promise.all([session.info, this.storeProfile(object)]);
                })
                .then(() => {
                    resolve(session);
                })
                .catch(reject);
        });
    }

    protected onRedirect(session: Session, url: URL): Promise<Session> {
        return new Promise((resolve, reject) => {
            session
                .handleIncomingRedirect({
                    url: url.toString(),
                    restorePreviousSession: this.options.restorePreviousSession,
                })
                .then((sessionInfo) => {
                    if (sessionInfo.isLoggedIn) {
                        this.session = session;
                        this.emitAsync('login', session);
                        resolve(session);
                    } else {
                        reject(new Error(`Unable to log in!`));
                    }
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
     * Automatically restore a previous session.
     * @default false
     */
    restorePreviousSession?: boolean;
    handleRedirect?: (redirectUrl: string) => void;
}

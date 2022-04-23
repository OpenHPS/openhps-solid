import {
    getClientAuthenticationWithDependencies,
    getDefaultSession,
    Session,
} from '@inrupt/solid-client-authn-browser';
import { SolidService, SolidDataServiceOptions } from '../common/SolidService';

export class SolidClientService extends SolidService {
    protected options: SolidClientServiceOptions;
    protected _session: Session;

    constructor(options?: SolidClientServiceOptions) {
        super(options);
        this.options.autoLogin = this.options.autoLogin ?? false;

        this.once('build', this._initialize.bind(this));
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

    get session(): Session {
        return this._session;
    }

    protected set session(value: Session) {
        if (value && value.info.isLoggedIn) {
            this.set('currentSession', value.info.sessionId);
        } else {
            this.delete('currentSession');
        }
        this._session = value;
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
     *
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
                    redirectUrl: this.options.redirectUrl ? this.options.redirectUrl : window.location.href,
                })
                .then(() => resolve(session))
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

    findSessionById(sessionId: string): Promise<Session> {
        return new Promise((resolve, reject) => {
            const clientAuth = getClientAuthenticationWithDependencies({
                secureStorage: this,
                insecureStorage: this,
            });
            clientAuth
                .getSessionInfo(sessionId)
                .then((sessionInfo) => {
                    if (sessionInfo === undefined) {
                        return resolve(undefined);
                    }
                    const session = new Session({
                        sessionInfo,
                        clientAuthentication: clientAuth,
                    });
                    if (sessionInfo.refreshToken) {
                        session.login({
                            oidcIssuer: sessionInfo.issuer,
                        });
                    }
                    return session;
                })
                .then((session: Session) => {
                    resolve(session);
                })
                .catch(reject);
        });
    }
}

export interface SolidClientServiceOptions extends SolidDataServiceOptions {
    /**
     * Automatically login after starting the server
     *
     * @default false
     */
    autoLogin?: boolean;
    /**
     * Automatically restore a previous session.
     *
     * @default false
     */
    restorePreviousSession?: boolean;
}

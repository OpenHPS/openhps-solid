import express from 'express';
const cookieSession = require('cookie-session'); // eslint-disable-line
import { Session, ISessionInfo, ISessionOptions } from '@inrupt/solid-client-authn-node';
import { SolidDataServiceOptions, SolidService, SolidSession } from '../common/SolidService';
import { SolidProfileObject } from '../common';
import { interactiveLogin } from 'solid-node-interactive-auth';

/**
 * Solid client service
 */
export class SolidClientService extends SolidService {
    protected options: SolidDataClientOptions;
    protected express: express.Express;

    constructor(options?: SolidDataClientOptions) {
        super(options);
        if (this.options.loginSuccessCallback)
            this.options.loginSuccessCallback = this.options.loginSuccessCallback.bind(this);
        if (this.options.loginErrorCallback)
            this.options.loginErrorCallback = this.options.loginErrorCallback.bind(this);
        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.options.authServer) {
                if (!Object.keys(this.options.authServer).includes('port')) {
                    this.express = this.options.authServer as express.Express;
                } else {
                    const authOptions = this.options.authServer as SolidAuthServerOptions;
                    this.express = express();
                    this.express.use(
                        cookieSession({
                            name: 'session',
                            keys: authOptions.cookies ? authOptions.cookies.keys : ['test', 'test2'],
                            maxAge: authOptions.cookies ? authOptions.cookies.maxAge : 24 * 60 * 60 * 1000,
                        }),
                    );
                    this.express.listen(authOptions.port, () => undefined);
                }
                this.express.get(this.options.loginPath, this.onLogin.bind(this));
                this.express.get(this.options.redirectPath, this.onRedirect.bind(this));
            }

            if (this.options.autoLogin) {
                this.login(this.options.defaultOidcIssuer)
                    .then(() => resolve())
                    .catch(reject);
            } else {
                resolve();
            }
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
     * Login a Solid user
     * @param {string} oidcIssuer OpenID Issuer
     * @param interactive
     * @returns {Promise<Session>} Session promise
     */
    login(oidcIssuer: string = this.options.defaultOidcIssuer, interactive: boolean = false): Promise<Session> {
        const session = this.createSession({
            storage: this.storage,
        });
        if (this.options.clientId === undefined || this.options.clientSecret === undefined) {
            throw new Error('Client ID and Client Secret must be set');
        }
        if (!interactive) {
            return new Promise((resolve, reject) => {
                session
                    .login({
                        oidcIssuer,
                        clientId: this.options.clientId,
                        clientSecret: this.options.clientSecret,
                        clientName: this.options.clientName,
                    })
                    .then(async () => {
                        this.session = session;
                        await this.storage.set('currentSession', session.info.sessionId);
                        return this.storage.get(`solidClientAuthenticationUser:${session.info.sessionId}`);
                    })
                    .then((data) => {
                        const sessionData = JSON.parse(data);
                        sessionData.webId = session.info.webId;
                        sessionData.issuer = oidcIssuer;
                        return this.storage.set(
                            `solidClientAuthenticationUser:${session.info.sessionId}`,
                            JSON.stringify(sessionData),
                        );
                    })
                    .then(() => {
                        const object = new SolidProfileObject(this.session.info.webId);
                        object.sessionId = this.session.info.sessionId;
                        return Promise.all([this.session.info, this.storeProfile(object)]);
                    })
                    .then(() => {
                        resolve(session);
                    })
                    .catch(reject);
            });
        } else {
            return interactiveLogin({
                session,
                oidcIssuer,
                clientId: this.options.clientId,
                clientSecret: this.options.clientSecret,
                clientName: this.options.clientName,
            });
        }
    }

    protected onLogin(req: express.Request, res: express.Response): void {
        const session = this.createSession({
            storage: this.storage,
        });
        req.session!.sessionId = session.info.sessionId;
        session
            .login({
                redirectUrl: this.options.redirectUrl,
                oidcIssuer: this.options.defaultOidcIssuer,
                clientName: this.options.clientName,
                handleRedirect: (redirectUrl) => res.redirect(redirectUrl),
            })
            .catch((reason) => {
                this.options.loginErrorCallback(req, res, session.info, reason);
            });
    }

    protected onRedirect(req: express.Request, res: express.Response): void {
        this.findSessionById(req.session!.sessionId)
            .then((session) => {
                return session.handleIncomingRedirect(req.protocol + '://' + req.get('host') + req.originalUrl);
            })
            .then((info) => {
                const object = new SolidProfileObject(info.webId);
                object.sessionId = info.sessionId;
                return Promise.all([info, this.storeProfile(object)]);
            })
            .then(([info]) => {
                if (info.isLoggedIn) {
                    this.options.loginSuccessCallback(req, res, info);
                } else {
                    this.options.loginErrorCallback(req, res, info, 'Not logged in after redirect');
                }
            })
            .catch((reason) => {
                this.options.loginErrorCallback(req, res, req.session!.sessionId, reason);
            });
    }

    protected createSession(options: Partial<ISessionOptions>): Session {
        return new Session(options);
    }
}

export interface SolidDataClientOptions extends SolidDataServiceOptions {
    loginPath?: string;
    redirectPath?: string;
    redirectUrl?: string;
    authServer?: SolidAuthServerOptions | express.Express;
    loginSuccessCallback?: (req: express.Request, res: express.Response, sessionInfo: ISessionInfo) => void;
    loginErrorCallback?: (req: express.Request, res: express.Response, sessionInfo: ISessionInfo, reason: any) => void;
}

export interface SolidAuthServerOptions {
    port: number;
    cookies?: {
        keys: string[];
        maxAge: number;
    };
}

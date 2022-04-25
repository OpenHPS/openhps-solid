import * as express from 'express';
const cookieSession = require('cookie-session'); // eslint-disable-line
import { Session, ISessionInfo, getSessionFromStorage } from '@inrupt/solid-client-authn-node';
import { SolidDataServiceOptions, SolidService } from '../common/SolidService';
import { SolidProfileObject } from '../common';
import { interactiveLogin } from 'solid-node-interactive-auth';

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
        return new Promise((resolve) => {
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
            resolve();
        });
    }

    /**
     * Interactive login a Solid CLI user
     *
     * @param {string} oidcIssuer OpenID Issuer
     * @returns {Promise<Session>} Session promise
     */
    interactiveLogin(oidcIssuer: string = this.options.defaultOidcIssuer): Promise<Session> {
        const session = new Session();
        return interactiveLogin({
            session,
            oidcIssuer,
        });
    }

    protected onLogin(req: express.Request, res: express.Response): void {
        const session = new Session({
            insecureStorage: this,
            secureStorage: this,
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
            .then(([info, object]) => {
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

    findSessionById(sessionId: string): Promise<Session> {
        return getSessionFromStorage(sessionId, this);
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

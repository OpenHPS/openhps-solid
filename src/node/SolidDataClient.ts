import * as express from 'express';
import cookieSession = require('cookie-session');
import { Session, ISessionInfo, getSessionFromStorage } from "@inrupt/solid-client-authn-node";
import { SolidDataService, SolidDataServiceOptions, } from "../common/SolidDataService";

export class SolidDataClient extends SolidDataService {
    protected options: SolidDataClientOptions;

    constructor(options?: SolidDataClientOptions) {
        super(options);

        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): void {
        this.options.express.get(this.options.loginPath, this.onLogin.bind(this));
        this.options.express.get(this.options.redirectPath, this.onRedirect.bind(this));
    }

    createServer(port: number): this {
        this.options.express = express();
        this.options.express.use(
            cookieSession({
                name: "session",
                // These keys are required by cookie-session to sign the cookies.
                keys: [
                    "Required, but value not relevant for this demo - key1",
                    "Required, but value not relevant for this demo - key2",
                ],
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            })
        );

        this.options.express.listen(port, () => {
            console.log("Listening on http://localhost:3030 ...");
        });
        return this;
    }

    protected onLogin(req: express.Request, res: express.Response): void {
        const session = new Session({
            insecureStorage: this,
            secureStorage: this
        });
        req.session!.sessionId = session.info.sessionId;
        session.login({
            redirectUrl: this.options.redirectUrl,
            oidcIssuer: this.options.defaultOidcIssuer,
            clientName: this.options.clientName,
            handleRedirect: (redirectUrl) => res.redirect(redirectUrl),
        }).catch(reason => {
            this.options.loginErrorCallback(req, res, session.info, reason);
        });
    }

    protected onRedirect(req: express.Request, res: express.Response): void {
        this.findSessionById(req.session!.sessionId).then(session => {
            return session.handleIncomingRedirect(req.protocol + "://" + req.get("host") + req.originalUrl);
        }).then(info => {
            if (info.isLoggedIn) {
                this.options.loginSuccessCallback(req, res, info);
            } else {
                this.options.loginErrorCallback(req, res, info, "Not logged in after redirect");
            }
        })
        .catch(reason => {
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
    authServer?: SolidAuthServerOptions;
    express?: express.Express;
    loginSuccessCallback?: (req: express.Request, res: express.Response, sessionInfo: ISessionInfo) => void;
    loginErrorCallback?: (req: express.Request, res: express.Response, sessionInfo: ISessionInfo, reason: any) => void;
}

export interface SolidAuthServerOptions {

}

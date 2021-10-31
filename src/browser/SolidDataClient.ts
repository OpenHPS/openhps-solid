import { 
    getClientAuthenticationWithDependencies,
    Session,
} from "@inrupt/solid-client-authn-browser";
import { SolidDataService, SolidDataServiceOptions } from "../common/SolidDataService";

export class SolidDataClient extends SolidDataService {

    constructor(options?: SolidDataServiceOptions) {
        super(options);
        this.once('build', this.login.bind(this));
    }

    login(): Promise<void> {
        return new Promise((resolve, reject) => {
            const session = new Session({
                insecureStorage: this,
                secureStorage: this,
            });
            session.login({
                oidcIssuer: this.options.defaultOidcIssuer,
                clientName: this.options.clientName,
                redirectUrl: this.options.redirectUrl,
                handleRedirect: this.onRedirect.bind(this, session)
            }).then(resolve).catch(reject);
        });
    }

    protected onRedirect(session: Session, url: URL): Promise<void> {
        return new Promise((resolve, reject) => {
            session.handleIncomingRedirect(url.toString()).then(sessionInfo => {
                if (sessionInfo.isLoggedIn) {
                    resolve();
                } else {
                    reject(new Error(`Unable to log in!`));
                }
            })
            .catch(reject);
        });
    }

    findSessionById(sessionId: string): Promise<Session> {
        return new Promise(async (resolve) => {
            const clientAuth = getClientAuthenticationWithDependencies({
                secureStorage: this,
                insecureStorage: this,
            });
            const sessionInfo = await clientAuth.getSessionInfo(sessionId);
            if (sessionInfo === undefined) {
                return resolve(undefined);
            }
            const session = new Session({
                sessionInfo,
                clientAuthentication: clientAuth,
            });
            if (sessionInfo.refreshToken) {
                await session.login({
                    oidcIssuer: sessionInfo.issuer,
                });
            }
            resolve(session);
        });
    }
}

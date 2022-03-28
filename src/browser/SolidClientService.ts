import { getClientAuthenticationWithDependencies, Session } from '@inrupt/solid-client-authn-browser';
import { SolidService, SolidDataServiceOptions } from '../common/SolidService';

export class SolidClientService extends SolidService {
    protected options: SolidClientServiceOptions;

    constructor(options?: SolidClientServiceOptions) {
        super(options);
        this.options.autoLogin = this.options.autoLogin ?? false;
        
        if (this.options.autoLogin) {
            this.once('build', this.login.bind(this));
        }
    }

    login(oidcIssuer: string = this.options.defaultOidcIssuer): Promise<void> {
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
                    handleRedirect: this.options.redirectUrl ? this.onRedirect.bind(this, session) : undefined,
                })
                .then(resolve)
                .catch(reject);
        });
    }

    protected onRedirect(session: Session, url: URL): Promise<void> {
        return new Promise((resolve, reject) => {
            session
                .handleIncomingRedirect(url.toString())
                .then((sessionInfo) => {
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

export interface SolidClientServiceOptions extends SolidDataServiceOptions {
    /**
     * Automatically login after starting the server
     *
     * @default false
     */
    autoLogin?: boolean;
}

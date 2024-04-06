import type {
    IStorageUtility,
    IClientRegistrar,
    IIssuerConfig,
    IClient,
    IClientRegistrarOptions,
} from '@inrupt/solid-client-authn-core';
import { registerClient } from '@inrupt/oidc-client-ext';

export class ClientRegistrar implements IClientRegistrar {
    constructor(private storageUtility: IStorageUtility) {
        this.storageUtility = storageUtility;
    }

    async getClient(options: IClientRegistrarOptions, issuerConfig: IIssuerConfig): Promise<IClient> {
        // If client secret and/or client id are stored in storage, use those.
        const [storedClientId, storedClientSecret, storedClientName, storedClientType] = await Promise.all([
            this.storageUtility.getForUser(options.sessionId, 'clientId', {
                secure: false,
            }),
            this.storageUtility.getForUser(options.sessionId, 'clientSecret', {
                secure: false,
            }),
            this.storageUtility.getForUser(options.sessionId, 'clientName', {
                secure: false,
            }),
            this.storageUtility.getForUser(options.sessionId, 'clientType', {
                secure: false,
            }),
        ]);
        if (storedClientId) {
            return {
                clientId: storedClientId,
                clientSecret: storedClientSecret,
                clientName: storedClientName,
                clientType: storedClientType,
            } as IClient;
        }

        try {
            const registeredClient = await registerClient(options, issuerConfig);
            // Save info
            const infoToSave: Record<string, string> = {
                clientId: registeredClient.clientId,
                clientType: 'dynamic',
            };
            if (registeredClient.clientSecret) {
                infoToSave.clientSecret = registeredClient.clientSecret;
            }
            if (registeredClient.idTokenSignedResponseAlg) {
                infoToSave.idTokenSignedResponseAlg = registeredClient.idTokenSignedResponseAlg;
            }
            await this.storageUtility.setForUser(options.sessionId, infoToSave, {
                secure: false,
            });
            return registeredClient;
        } catch (error) {
            throw new Error(`Client registration failed: [${error}]`);
        }
    }
}

import { DataFrame, DataObject, DataServiceDriver, KeyValueDataService, MemoryDataService, Model, Constructor } from "@openhps/core";
import type { Session as BrowserSession } from '@inrupt/solid-client-authn-browser';
import type { Session as NodeSession } from '@inrupt/solid-client-authn-node';
import type { IStorage } from '@inrupt/solid-client-authn-core';

export abstract class SolidDataService extends KeyValueDataService implements IStorage {
    protected options: SolidDataServiceOptions;
    public model: Model<any, any>;
    private static readonly PREFIX = "OpenHPS:solid";

    constructor(options?: SolidDataServiceOptions) {
        super(undefined, options.dataServiceDriver || new MemoryDataService(String));
        this.uid = this.constructor.name;
        this.options = options || {};
        this.options.defaultOidcIssuer = this.options.defaultOidcIssuer || "https://broker.pod.inrupt.com/";
    }

    /**
     * Alias for getValue
     *
     * @param {string} key Key of the key value pair 
     * @returns {Promise<string | undefined>} Value
     */
    async get(key: string): Promise<string | undefined> {
        return this.getValue(key);
    }

    /**
     * Alias for setValue
     *
     * @param {string} key Key of the key value pair 
     * @param {string} value Value to store
     * @returns {Promise<void>} Store promise
     */
    async set(key: string, value: string): Promise<void> {
        this.setValue(key, value);
    }

    /**
     * Find session by session identifier
     *
     * @param {string} sessionId Session identifier
     * @returns {SolidSession} Browser or Node session
     */
    abstract findSessionById(sessionId: string): Promise<SolidSession>;

    /**
     * Find session by WebID
     *
     * @param {string} webId Web Identifier
     * @returns {SolidSession} Browser or Node session
     */
    findSessionByWebId(webId: string): Promise<SolidSession> {
        return new Promise((resolve, reject) => {
            const key = `${SolidDataService.PREFIX}:webId:${webId}`;
            this.get(key).then(sessionId => {
                if (!sessionId) {
                    resolve(undefined);
                    return;
                }
                return this.findSessionById(sessionId);
            }).then(resolve).catch(reject);
        });  
    }

    /**
     * Find session by object identifier
     *
     * @param {Constructor<DataObject | DataFrame>} dataType Data type of data object or data frame 
     * @param {string} uid Object unique identifier 
     * @returns {SolidSession} Browser or Node session
     */
    findSessionByObjectUID(dataType: Constructor<DataObject | DataFrame>, uid: string): Promise<SolidSession> {
        return new Promise((resolve, reject) => {
            const prefix = `${SolidDataService.PREFIX}:${dataType.name}`;
            const key = `${prefix}:${uid}`;
            this.get(key).then(sessionId => {
                return this.findSessionById(sessionId);
            }).then(resolve).catch(reject);
        });
    }

    linkSession(object: DataObject | DataFrame, sessionId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const prefix = `${SolidDataService.PREFIX}:${object.constructor.name}`;
            this.set(`${prefix}:${object.uid}`, sessionId).then(resolve).catch(reject);
        });
    }

    unlinkSession(object: DataObject | DataFrame | string): Promise<void> {
        return new Promise((resolve, reject) => {
            const prefix = `${SolidDataService.PREFIX}:${object.constructor.name}`;
            const key = `${prefix}:${(object instanceof DataObject || object instanceof DataFrame) ? object.uid : object}`;
            this.delete(key).then(resolve).catch(reject);
        });
    }
}

export interface SolidDataServiceOptions {
    /**
     * Client name displayed to the user
     */
    clientName?: string;
    /**
     * Redirect URL
     */
    redirectUrl?: string;
    defaultOidcIssuer?: string;
    dataServiceDriver?: DataServiceDriver<string, string>;
}

export type SolidSession = BrowserSession | NodeSession;

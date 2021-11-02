import { DataFrame, DataObject, DataServiceDriver, KeyValueDataService, MemoryDataService, Model, Constructor, RemoteService, PullOptions, PushOptions } from "@openhps/core";
import type { Session as BrowserSession } from '@inrupt/solid-client-authn-browser';
import type { Session as NodeSession } from '@inrupt/solid-client-authn-node';
import type { IStorage } from '@inrupt/solid-client-authn-core';
import { SolidProfileObject } from "./SolidProfileObject";
import { getSolidDataset, getStringNoLocale, getThing, setStringNoLocale } from "@inrupt/solid-client";
import { VCARD } from "@inrupt/vocab-common-rdf";

export abstract class SolidService extends RemoteService implements IStorage {
    protected options: SolidDataServiceOptions;
    protected driver: DataServiceDriver<string, string>;
    model: Model<any, any>;
    private static readonly PREFIX = "OpenHPS:solid";

    constructor(options?: SolidDataServiceOptions) {
        super();
        this.options = options || {};
        this.driver = this.options.dataServiceDriver || new MemoryDataService(String) as unknown as DataServiceDriver<string, string>;
        this.uid = this.constructor.name;
        this.options.defaultOidcIssuer = this.options.defaultOidcIssuer || "https://broker.pod.inrupt.com/";
    }

    /**
     * Send a push to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {DataFrame} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
    remotePush<T extends DataFrame | DataFrame[]>(uid: string, frame: T, options?: PushOptions): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }
    
    /**
     * Send a pull request to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {PullOptions} [options] Pull options
     */
    remotePull(uid: string, options?: PullOptions): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * Send an error to a remote node
     *
     * @param {string} uid Remote Node UID
     * @param {string} event Event to send
     * @param {any[]} [args] Event argument
     */
    remoteEvent(uid: string, event: string, ...args: any[]): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * Send a remote service call
     *
     * @param {string} uid Service uid
     * @param {string} method Method to call
     * @param {any[]} [args] Optional set of arguments
     */
    remoteServiceCall(uid: string, method: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * Fetch profile information
     *
     * @param {SolidProfileObject} object Data object to fetch profile information for 
     * @returns {Promise<SolidDataObject>} Promise of data object with profile information
     */
    fetchProfile(object: SolidProfileObject): Promise<SolidProfileObject> {
        return new Promise((resolve, reject) => {
            this.findSessionByWebId(object.webId).then(session => {
                return getSolidDataset(object.profileDocumentUrl.href, session ? {
                    fetch: session.fetch
                } : undefined);
            }).then(dataset => {
                const profile = getThing(dataset, object.webId);
                object.displayName = getStringNoLocale(profile, VCARD.fn);
                resolve(object);
            }).catch(reject);
        });
    }

    /**
     * Store profile information
     *
     * @param {SolidProfileObject} object Data object to store profile information for 
     * @returns {Promise<void>} Promise of storing
     */
    storeProfile(object: SolidProfileObject): Promise<SolidProfileObject> {
        return new Promise((resolve, reject) => {
            const key = `${SolidService.PREFIX}:webId:${object.webId}`;
            this.set(key, object.sessionId).then(() => {
                return this.findSessionByWebId(object.webId);
            }).then(session => {
                return getSolidDataset(object.profileDocumentUrl.href, session ? {
                    fetch: session.fetch
                } : undefined);
            }).then(dataset => {
                const profile = getThing(dataset, object.webId);
                setStringNoLocale(profile, VCARD.fn, object.displayName);
                resolve(object);
            }).catch(reject);
        });
    }

    /**
     * Get a key value
     *
     * @param {string} key Key of the key value pair 
     * @returns {Promise<string | undefined>} Value
     */
    get(key: string): Promise<string | undefined> {
        return new Promise((resolve) => {
            this.driver.findByUID(key).then(resolve).catch(() => resolve(undefined));
        });
    }

    /**
     * Set a key vlaue
     *
     * @param {string} key Key of the key value pair 
     * @param {string} value Value to store
     * @returns {Promise<void>} Store promise
     */
    set(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.driver.insert(key, value).then(() => resolve()).catch(reject);
        });
    }

    /**
     * Delete an object
     *
     * @param {string} key Key of the key value pair 
     * @returns {Promise<void>} Store promise
     */
    delete(key: string): Promise<void> {
        return new Promise((resolve) => {
            this.driver.delete(key).then(resolve).catch(() => resolve(undefined));
        });
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
            const key = `${SolidService.PREFIX}:webId:${webId}`;
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
            const prefix = `${SolidService.PREFIX}:${dataType.name}`;
            const key = `${prefix}:${uid}`;
            this.get(key).then(sessionId => {
                return this.findSessionById(sessionId);
            }).then(resolve).catch(reject);
        });
    }

    linkSession(object: DataObject | DataFrame, sessionId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const prefix = `${SolidService.PREFIX}:${object.constructor.name}`;
            this.set(`${prefix}:${object.uid}`, sessionId).then(resolve).catch(reject);
        });
    }

    unlinkSession(object: DataObject | DataFrame | string): Promise<void> {
        return new Promise((resolve, reject) => {
            const prefix = `${SolidService.PREFIX}:${object.constructor.name}`;
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

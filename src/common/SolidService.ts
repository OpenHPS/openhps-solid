import {
    DataFrame,
    DataObject,
    DataServiceDriver,
    MemoryDataService,
    Model,
    Constructor,
    RemoteService,
    PullOptions,
    PushOptions,
    Serializable,
} from '@openhps/core';
import type {
    Session as BrowserSession,
    ISessionOptions as ISessionBrowserOptions,
    ISessionInfo,
} from '@inrupt/solid-client-authn-browser';
import type { Session as NodeSession } from '@inrupt/solid-client-authn-node';
import type { IStorage, ClientAuthentication, IClient } from '@inrupt/solid-client-authn-core';
import { SolidProfileObject } from './SolidProfileObject';
import {
    getStringNoLocale,
    getThing,
    saveSolidDatasetAt,
    createContainerAt,
    deleteSolidDataset,
    setStringNoLocale,
    setThing,
    SolidDataset,
    createSolidDataset,
    Thing,
    ThingPersisted,
    FetchError,
    getPodUrlAll,
    deleteContainer,
    universalAccess,
    getSolidDataset,
} from '@inrupt/solid-client';
import { fetch } from 'cross-fetch';
import { vcard, Quad_Subject, DataFactory, Quad_Object, Quad, Store, IriString, foaf } from '@openhps/rdf';
import { DatasetSubscription } from './DatasetSubscription';
import { ISessionOptions } from '@inrupt/solid-client-authn-node';
import type { AccessModes } from '@inrupt/solid-client/dist/interfaces';
import { StorageUtility } from '@inrupt/solid-client-authn-core';
import { ClientRegistrar } from './ClientRegistrar';
import { SessionManager } from './SessionManager';

class StorageUtilityWrapper extends StorageUtility {
    constructor(secureStorage: IStorage, insecureStorage: IStorage) {
        super(secureStorage, insecureStorage);
    }
}

class SolidStorage implements IStorage {
    protected driver: DataServiceDriver<string, string>;
    constructor(driver: DataServiceDriver<string, string>) {
        this.driver = driver;
    }

    /**
     * Get a key value
     * @param {string} key Key of the key value pair
     * @returns {Promise<string | undefined>} Value
     */
    get(key: string): Promise<string | undefined> {
        return new Promise((resolve) => {
            this.driver
                .findByUID(key)
                .then((s) => {
                    resolve(s as string);
                })
                .catch(() => {
                    resolve(undefined);
                });
        });
    }

    /**
     * Set a key vlaue
     * @param {string} key Key of the key value pair
     * @param {string} value Value to store
     * @returns {Promise<void>} Store promise
     */
    set(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.driver
                .insert(key, value)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Delete an object
     * @param {string} key Key of the key value pair
     * @returns {Promise<void>} Store promise
     */
    delete(key: string): Promise<void> {
        return new Promise((resolve) => {
            this.driver
                .delete(key)
                .then(resolve)
                .catch(() => resolve(undefined));
        });
    }
}

export abstract class SolidService extends RemoteService {
    protected options: SolidDataServiceOptions;
    storage: IStorage;
    protected storageUtility: StorageUtility;
    readonly clientRegistrar: ClientRegistrar;
    readonly sessionManager: SessionManager;
    model: Model<any, any>;
    public static readonly PREFIX = 'OpenHPS:solid';
    protected driver: DataServiceDriver<string, string>;
    protected _session: SolidSession;
    protected _clientAuthentication: ClientAuthentication;

    constructor(options?: SolidDataServiceOptions) {
        super();
        this.options = options || {};
        // Storage
        this.driver = this.options.dataServiceDriver || new MemoryDataService<string, string>(String as unknown as any);
        this.storage = new SolidStorage(this.driver);
        this.storageUtility = new StorageUtilityWrapper(this.storage, this.storage);

        this.clientRegistrar = new ClientRegistrar(this.storageUtility);

        this.uid = this.constructor.name;
        this.options.defaultOidcIssuer = this.options.defaultOidcIssuer || 'https://login.inrupt.com/';

        this.once('build', () => {
            return this.driver.emitAsync('build');
        });
    }

    get session(): SolidSession {
        return this._session;
    }

    protected set session(value: SolidSession) {
        this._session = value;
    }

    get clientAuthentication(): ClientAuthentication {
        if (this._clientAuthentication) {
            return this._clientAuthentication;
        }
        const dummy = this.createSession({
            sessionInfo: {
                isLoggedIn: false,
                sessionId: 'dummy',
            },
            storage: this.storage,
            insecureStorage: this.storage,
            secureStorage: this.storage,
        });
        this._clientAuthentication = (dummy as any).clientAuthentication;
        return this._clientAuthentication;
    }

    /**
     * Get the URL of a document
     * @param {SolidSession}    session Solid session to get an URL from
     * @param {string}          [path]  Path to append to the document URL
     * @returns {URL}                    Document URL
     */
    async getDocumentURL(session: SolidSession, path?: string): Promise<URL> {
        const podURL = new URL(await this.getPodUrl(session));
        const webIdURL = new URL(session.info.webId);
        webIdURL.pathname = '';
        webIdURL.hash = '';
        const documentURL = new URL(podURL.href);
        if (path) {
            const normalizedPath = path.replace(podURL.href, '').replace(webIdURL.href, '');
            const pathURL = new URL(
                (podURL.pathname.length > 1 ? podURL.pathname : '') + normalizedPath.replace(/^\//, ''),
                podURL.href,
            );
            documentURL.pathname = pathURL.pathname;
            documentURL.hash = pathURL.hash;
        }
        return documentURL;
    }

    getPodUrl(session: SolidSession): Promise<IriString> {
        return new Promise((resolve, reject) => {
            getPodUrlAll(session.info.webId, {
                fetch: session.fetch,
            })
                .then((value) => {
                    if (value[0] === undefined) {
                        return reject(
                            new Error(
                                'No pod URL found! Please ensure you have a pim:storage or solid:storage predicate in your profile document!',
                            ),
                        );
                    }
                    resolve(value[0] as IriString);
                })
                .catch(reject);
        });
    }

    /**
     * Get a Solid dataset as an N3 Quads dataset
     * @param {SolidSession} session Solid session to get a thing from
     * @param {string} uri URI of the thing in the Solid Pod
     * @returns {Promise<Store>} Promise of a solid dataset store
     */
    getDatasetStore(session: SolidSession, uri: string): Promise<Store> {
        return new Promise((resolve, reject) => {
            /**
             *
             * @param subject
             * @param predicates
             */
            function convertPredicates(subject: Quad_Subject, predicates: any): Quad[] {
                return Object.keys(predicates)
                    .map((key) => {
                        const predicate = DataFactory.namedNode(key);
                        const objects: Quad_Object[] = [];
                        objects.push(
                            ...Object.keys(predicates[key].literals ?? {})
                                .map((dataTypeIRI) => {
                                    return predicates[key].literals[dataTypeIRI].map((val: string) => {
                                        return DataFactory.literal(val, dataTypeIRI);
                                    });
                                })
                                .reduce((a, b) => a.concat(b), []),
                        );
                        objects.push(
                            ...Object.keys(predicates[key].langStrings ?? {})
                                .map((locale) => {
                                    return predicates[key].langStrings[locale].map((val: string) => {
                                        return DataFactory.literal(val, locale);
                                    });
                                })
                                .reduce((a, b) => a.concat(b), []),
                        );
                        objects.push(
                            ...(predicates[key].namedNodes ?? []).map((uri: string) => {
                                return DataFactory.namedNode(uri);
                            }),
                        );
                        return objects
                            .map((object) => new Quad(subject, predicate, object))
                            .concat(
                                ...Object.keys(predicates[key].blankNodes ?? {})
                                    .map((blankNode: string) => {
                                        return convertPredicates(
                                            DataFactory.blankNode(blankNode),
                                            predicates[key].blankNodes[blankNode],
                                        );
                                    })
                                    .reduce((a, b) => a.concat(b), []),
                            );
                    })
                    .reduce((a, b) => a.concat(b), []);
            }
            this.getDataset(session, uri)
                .then((dataset) => {
                    const quads: Quad[] = Object.keys(dataset.graphs)
                        .map((key) => {
                            const graph = dataset.graphs[key];
                            return Object.values(graph)
                                .map((thing) => {
                                    const subject = DataFactory.namedNode(thing.url);
                                    return convertPredicates(subject, thing.predicates);
                                })
                                .reduce((a, b) => a.concat(b), []);
                        })
                        .reduce((a, b) => a.concat(b), []);
                    resolve(new Store(quads));
                })
                .catch(reject);
        });
    }

    /**
     * Get a Solid dataset
     * @param {SolidSession} session Solid session to get a thing from
     * @param {string} uri URI of the thing in the Solid Pod
     * @returns {Promise<SolidDataset>} Promise of a solid dataset
     */
    getDataset(session: SolidSession, uri: string): Promise<SolidDataset> {
        return new Promise(async (resolve, reject) => {
            const documentURL = uri.startsWith('http') ? new URL(uri) : await this.getDocumentURL(session, uri);
            documentURL.hash = '';
            getSolidDataset(
                documentURL.href,
                session
                    ? {
                          fetch: session.fetch,
                      }
                    : undefined,
            )
                .then(resolve)
                .catch((ex: FetchError) => {
                    if (ex.response.status === 404) {
                        resolve(createSolidDataset() as any);
                    } else {
                        reject(ex);
                    }
                });
        });
    }

    /**
     * Get a Solid dataset subscription
     * @param {SolidSession} session Solid session to get a subscription from
     * @param {string} uri URI of the thing in the Solid Pod
     * @returns {Promise<DatasetSubscription>} Promise of a solid dataset subscription
     */
    getDatasetSubscription(session: SolidSession, uri: string): Promise<DatasetSubscription> {
        return new Promise((resolve, reject) => {
            const fetchFn = session ? session.fetch : fetch;
            fetchFn(uri, {
                method: 'HEAD',
            })
                .then((response) => {
                    const websocketUri = response.headers.get('updates-via');
                    if (!websocketUri) {
                        return resolve(undefined);
                    }
                    DatasetSubscription.create(websocketUri)
                        .then((subscription) => {
                            subscription.subscribe(uri);
                            resolve(subscription);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Create a Solid container
     * @param session Solid session to create a container with
     * @param url URL of the container
     * @returns Promise of the container
     */
    createContainer(session: SolidSession, url: IriString): Promise<SolidDataset> {
        return new Promise((resolve, reject) => {
            createContainerAt(
                url,
                session
                    ? {
                          fetch: session.fetch,
                      }
                    : undefined,
            )
                .then(resolve)
                .catch(reject);
        });
    }

    deleteContainer(session: SolidSession, url: IriString): Promise<void> {
        return new Promise((resolve, reject) => {
            deleteContainer(
                url,
                session
                    ? {
                          fetch: session.fetch,
                      }
                    : undefined,
            )
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Delete a Solid dataset
     * @param {SolidSession} session Solid session to get a thing from
     * @param {string} uri URI of the thing in the Solid Pod
     * @returns {Promise<SolidDataset>} Promise of a solid dataset
     */
    deleteDataset(session: SolidSession, uri: string): Promise<void> {
        return new Promise((resolve, reject) => {
            deleteSolidDataset(
                uri,
                session
                    ? {
                          fetch: session.fetch,
                      }
                    : undefined,
            )
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Save a Solid dataset
     * @param {SolidSession} session Solid session to get a thing from
     * @param {string} uri URI of the thing in the Solid Pod
     * @param {SolidDataset} dataset Dataset to save at the uri
     * @returns {Promise<SolidDataset>} Promise of a solid dataset
     */
    saveDataset(session: SolidSession, uri: string, dataset?: SolidDataset): Promise<SolidDataset> {
        return new Promise((resolve, reject) => {
            saveSolidDatasetAt(
                uri,
                dataset ? dataset : createSolidDataset(),
                session
                    ? {
                          fetch: session.fetch,
                      }
                    : undefined,
            )
                .then((dataset) => {
                    resolve(dataset);
                })
                .catch(reject);
        });
    }

    /**
     * Get a thing from a session Pod
     * @param {SolidSession} session Solid session to get a thing from
     * @param {string} uri URI of the thing in the Solid Pod
     * @returns {Promise<ThingPersisted>} Persisted thing
     */
    getThing(session: SolidSession, uri: string): Promise<ThingPersisted> {
        return new Promise((resolve, reject) => {
            this.getDataset(session, uri)
                .then((dataset) => {
                    const thing = getThing(dataset, uri);
                    resolve(thing);
                })
                .catch(reject);
        });
    }

    /**
     * Set access control list for a specific object
     * @param {IriString} uri URI of the object
     * @param {Partial<AccessModes>} acces Access modes
     * @param {string} [webId] WebID to set access for
     * @param {SolidSession} [session] Session to use
     */
    setAccess(
        uri: IriString,
        acces: Partial<AccessModes>,
        webId: string = foaf.Agent,
        session?: SolidSession,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            universalAccess
                .setAgentAccess(
                    uri,
                    webId,
                    acces,
                    session
                        ? {
                              fetch: session.fetch,
                          }
                        : undefined,
                )
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Get access control list for a specific resource
     * @param {SolidSession} session Session to use
     * @param uri
     * @param webId WebID to get access control list for
     * @returns Access control list
     */
    getAccess(uri: IriString, webId: string = foaf.Agent, session?: SolidSession): Promise<AccessModes> {
        return new Promise((resolve, reject) => {
            universalAccess
                .getAgentAccess(
                    uri,
                    webId,
                    session
                        ? {
                              fetch: session.fetch,
                          }
                        : undefined,
                )
                .then((access) => {
                    resolve(access);
                })
                .catch(reject);
        });
    }

    /**
     * Set a thing in a session Pod
     * @param {SolidSession} session Solid session to set a thing to
     * @param {Thing} thing Non-persisted thing to store in the Pod
     * @param {SolidDataset} [dataset]
     * @returns {Promise<SolidDataset>} Promise if stored
     */
    createThing(session: SolidSession, thing: Thing, dataset?: SolidDataset): Promise<SolidDataset> {
        return new Promise((resolve, reject) => {
            const documentURL = new URL(thing.url);
            documentURL.hash = '';
            /**
             *
             * @param dataset
             * @param persist
             */
            function setThingInDataset(dataset: SolidDataset, persist = true): void {
                const existingThing = getThing(dataset, thing.url) ?? {};
                const newThing = this._mergeDeep(existingThing, thing);
                dataset = setThing(dataset, newThing);
                if (persist) {
                    this.saveDataset(session, dataset, documentURL.href)
                        .then(() => {
                            resolve(dataset);
                        })
                        .catch(reject);
                } else {
                    resolve(dataset);
                }
            }
            if (dataset) {
                setThingInDataset.bind(this)(dataset, false);
            } else {
                this.getDataset(session, documentURL.href)
                    .then((dataset) => {
                        setThingInDataset.bind(this)(dataset);
                    })
                    .catch(reject);
            }
        });
    }

    /**
     * Check if something is an object
     * @param {any} item Item to check for object
     * @returns {boolean} Is an object
     */
    private _isObject(item: any) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * Deep merge objects
     * @param {any} target Target object
     * @param {any} source Source object
     * @returns {any} Merged object
     */
    private _mergeDeep(target: any, source: any) {
        const output = Object.assign({}, target);
        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (Array.isArray(source[key])) {
                    output[key] = source[key];
                    output[key].push(...(target[key] || []));
                } else if (this._isObject(source[key])) {
                    if (!(key in target)) Object.assign(output, { [key]: source[key] });
                    else output[key] = this._mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    /**
     * Send a push to a specific remote node
     * @param {string} uid Remote Node UID
     * @param {DataFrame} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
    remotePush<T extends DataFrame | DataFrame[]>(uid: string, frame: T, options?: PushOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        });
    }

    /**
     * Send a pull request to a specific remote node
     * @param {string} uid Remote Node UID
     * @param {PullOptions} [options] Pull options
     */
    remotePull(uid: string, options?: PullOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        });
    }

    /**
     * Send an error to a remote node
     * @param {string} uid Remote Node UID
     * @param {string} event Event to send
     * @param {any[]} [args] Event argument
     */
    remoteEvent(uid: string, event: string, ...args: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        });
    }

    /**
     * Send a remote service call
     * @param {string} uid Service uid
     * @param {string} method Method to call
     * @param {any[]} [args] Optional set of arguments
     */
    remoteServiceCall(uid: string, method: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        });
    }

    /**
     * Fetch profile information
     * @param {SolidProfileObject} object Data object to fetch profile information for
     * @returns {Promise<SolidProfileObject>} Promise of data object with profile information
     */
    fetchProfile(object: SolidProfileObject): Promise<SolidProfileObject> {
        return new Promise((resolve, reject) => {
            this.findSessionByWebId(object.webId)
                .then((session) => {
                    return getSolidDataset(
                        object.profileDocumentUrl.href,
                        session
                            ? {
                                  fetch: session.fetch,
                              }
                            : undefined,
                    );
                })
                .then((dataset) => {
                    const profile = getThing(dataset, object.webId);
                    object.displayName = getStringNoLocale(profile, vcard.fn);
                    resolve(object);
                })
                .catch(reject);
        });
    }

    /**
     * Store profile information
     * @param {SolidProfileObject} object Data object to store profile information for
     * @returns {Promise<void>} Promise of storing
     */
    storeProfile(object: SolidProfileObject): Promise<SolidProfileObject> {
        return new Promise((resolve, reject) => {
            const key = `${SolidService.PREFIX}:webId:${object.webId}`;
            this.storage
                .set(key, object.sessionId)
                .then(() => {
                    return this.findSessionByWebId(object.webId);
                })
                .then((session) => {
                    const profileDocumentUrl = object.profileDocumentUrl;
                    if (!profileDocumentUrl) {
                        resolve(undefined);
                        return;
                    }
                    return getSolidDataset(
                        profileDocumentUrl.href,
                        session
                            ? {
                                  fetch: session.fetch,
                              }
                            : undefined,
                    );
                })
                .then((dataset) => {
                    const profile = getThing(dataset, object.webId);
                    setStringNoLocale(profile, vcard.fn, object.displayName);
                    resolve(object);
                })
                .catch(reject);
        });
    }

    /**
     * Find session information by session identifier
     * @param {string} sessionId Session identifier
     * @returns {ISessionInfo & ISessionInternalInfo} Session info
     */
    findSessionInfoById(sessionId: string): Promise<ISessionInfo & ISessionInternalInfo> {
        return new Promise((resolve, reject) => {
            // First check in memory
            this.clientAuthentication
                .getSessionInfo(sessionId)
                .then((sessionInfo) => {
                    resolve(sessionInfo);
                })
                .catch(reject);
        });
    }

    /**
     * Find session by session identifier
     * @param {string} sessionId Session identifier
     * @returns {SolidSession} Browser or Node session
     */
    findSessionById(sessionId: string): Promise<SolidSession> {
        return new Promise((resolve, reject) => {
            let session: SolidSession = undefined;
            this.findSessionInfoById(sessionId)
                .then((sessionInfo) => {
                    if (sessionInfo === undefined) {
                        resolve(undefined);
                        return;
                    }
                    session = this.createSession({
                        sessionInfo,
                        storage: this.storage,
                        insecureStorage: this.storage,
                        secureStorage: this.storage,
                    });
                    // Validate session
                    if (!sessionInfo.isLoggedIn && sessionInfo.issuer) {
                        return session.login({
                            oidcIssuer: sessionInfo.issuer,
                            clientId: sessionInfo.clientAppId,
                            clientSecret: sessionInfo.clientAppSecret,
                            handleRedirect: () => {},
                        });
                    }
                })
                .then(() => {
                    resolve(session);
                })
                .catch(reject);
        });
    }

    /**
     * Find session by WebID
     * @param {string} webId Web Identifier
     * @returns {SolidSession} Browser or Node session
     */
    findSessionByWebId(webId: string): Promise<SolidSession> {
        return new Promise((resolve, reject) => {
            const key = `${SolidService.PREFIX}:webId:${webId}`;
            this.storage
                .get(key)
                .then((sessionId) => {
                    if (!sessionId) {
                        resolve(undefined);
                        return;
                    }
                    return this.findSessionById(sessionId);
                })
                .then((session) => {
                    resolve(session);
                })
                .catch(reject);
        });
    }

    /**
     * Find session by object identifier
     * @param {Constructor<DataObject | DataFrame>} dataType Data type of data object or data frame
     * @param {string} uid Object unique identifier
     * @returns {SolidSession} Browser or Node session
     */
    findSessionByObjectUID(dataType: Constructor<DataObject | DataFrame>, uid: string): Promise<SolidSession> {
        return new Promise((resolve, reject) => {
            const prefix = `${SolidService.PREFIX}:${dataType.name}`;
            const key = `${prefix}:${uid}`;
            this.storage
                .get(key)
                .then((sessionId) => {
                    return this.findSessionById(sessionId);
                })
                .then(resolve)
                .catch(reject);
        });
    }

    linkSession(object: DataObject | DataFrame, sessionId: string, type?: Serializable<any>): Promise<void> {
        return new Promise((resolve, reject) => {
            const constructor = type ?? object.constructor;
            const prefix = `${SolidService.PREFIX}:${constructor.name}`;
            const key = `${prefix}:${object.uid}`;
            this.storage.set(key, sessionId).then(resolve).catch(reject);
        });
    }

    unlinkSession(object: DataObject | DataFrame | string, type?: Serializable<any>): Promise<void> {
        return new Promise((resolve, reject) => {
            const constructor = type ?? object.constructor;
            const prefix = `${SolidService.PREFIX}:${constructor.name}`;
            const key = `${prefix}:${
                object instanceof DataObject || object instanceof DataFrame ? object.uid : object
            }`;
            this.storage.delete(key).then(resolve).catch(reject);
        });
    }

    protected abstract createSession(options: Partial<ISessionOptions | ISessionBrowserOptions>): SolidSession;
}

export interface SolidDataServiceOptions {
    /**
     * Client name displayed to the user
     */
    clientName?: string;
    /**
     * Client identifier
     */
    clientId?: string;
    /**
     * Client secret
     */
    clientSecret?: string;
    /**
     * Automatically login after starting the server
     * @default false
     */
    autoLogin?: boolean;
    /**
     * Redirect URL
     */
    redirectUrl?: string;
    defaultOidcIssuer?: string;
    /**
     * Data service driver to use for key:value pairs
     * In a browser this should be @openhps/localstorage
     */
    dataServiceDriver?: DataServiceDriver<string, string>;
}

export type SolidSession = BrowserSession | NodeSession;

export interface ISessionInternalInfo {
    /**
     * The refresh token associated with the session (if any).
     */
    refreshToken?: string;
    /**
     * The OIDC issuer that issued the tokens authenticating the session.
     */
    issuer?: string;
    /**
     * The redirect URL registered when initially logging the session in.
     */
    redirectUrl?: string;
    /**
     * For public clients, and Solid Identity Providers that do not support Client
     * WebIDs, the client secret is still required at the token endpoint.
     */
    clientAppSecret?: string;
    /**
     * The token type used by the session
     */
    tokenType?: 'DPoP' | 'Bearer';
}

export { ISessionInfo };

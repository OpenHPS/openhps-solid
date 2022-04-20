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
} from '@openhps/core';
import type { Session as BrowserSession } from '@inrupt/solid-client-authn-browser';
import type { Session as NodeSession } from '@inrupt/solid-client-authn-node';
import type { IStorage } from '@inrupt/solid-client-authn-core';
import { SolidProfileObject } from './SolidProfileObject';
import {
    getSolidDataset,
    getStringNoLocale,
    getThing,
    saveSolidDatasetAt,
    setStringNoLocale,
    setThing,
    SolidDataset,
    createSolidDataset,
    Thing,
    ThingPersisted,
    FetchError,
} from '@inrupt/solid-client';
import { vcard } from '@openhps/rdf/vocab';
import { Quad_Subject, DataFactory, Quad_Object, Quad, Store, IriString } from '@openhps/rdf/serialization';
import { WebsocketNotification } from '@inrupt/solid-client-notifications';

export abstract class SolidService extends RemoteService implements IStorage {
    protected options: SolidDataServiceOptions;
    protected driver: DataServiceDriver<string, String>;
    model: Model<any, any>;
    private static readonly PREFIX = 'OpenHPS:solid';

    constructor(options?: SolidDataServiceOptions) {
        super();
        this.options = options || {};
        this.driver = this.options.dataServiceDriver || new MemoryDataService(String);
        this.uid = this.constructor.name;
        this.options.defaultOidcIssuer = this.options.defaultOidcIssuer || 'https://broker.pod.inrupt.com/';
    }

    getDocumentURL(session: SolidSession, path?: string): URL {
        const documentURL = new URL(session.info.webId);
        if (path) {
            const pathURL = new URL(path, 'http://localhost');
            documentURL.pathname = documentURL.pathname.replace('/profile/card', '') + pathURL.pathname;
            documentURL.hash = pathURL.hash;
        }
        return documentURL;
    }

    /**
     * Get a Solid dataset as an N3 Quads dataset
     *
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
     *
     * @param {SolidSession} session Solid session to get a thing from
     * @param {string} uri URI of the thing in the Solid Pod
     * @returns {Promise<SolidDataset>} Promise of a solid dataset
     */
    getDataset(session: SolidSession, uri: string): Promise<SolidDataset> {
        return new Promise((resolve, reject) => {
            const documentURL = this.getDocumentURL(session, uri);
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
                        resolve(createSolidDataset());
                    } else {
                        reject(ex);
                    }
                });
        });
    }

    /**
     * Save a Solid dataset
     *
     * @param {SolidSession} session Solid session to get a thing from
     * @param dataset
     * @param {string} uri URI of the thing in the Solid Pod
     * @returns {Promise<SolidDataset>} Promise of a solid dataset
     */
    saveDataset(session: SolidSession, dataset: SolidDataset, uri: string): Promise<void> {
        return new Promise((resolve, reject) => {
            saveSolidDatasetAt(
                uri,
                dataset,
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
     * Get a thing from a session Pod
     *
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
     * Set a thing in a session Pod
     *
     * @param {SolidSession} session Solid session to set a thing to
     * @param {Thing} thing Non-persisted thing to store in the Pod
     * @returns {Promise<void>} Promise if stored
     */
    setThing(session: SolidSession, thing: Thing): Promise<void> {
        return new Promise((resolve, reject) => {
            const documentURL = new URL(thing.url);
            documentURL.hash = '';
            this.getDataset(session, documentURL.href)
                .then((dataset) => {
                    const existingThing = getThing(dataset, thing.url) ?? {};
                    const newThing = this._mergeDeep(existingThing, thing);
                    dataset = setThing(dataset, newThing);
                    return this.saveDataset(session, dataset, documentURL.href);
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    /**
     * Create a notification lsitener for a container URL
     *
     * @param {SolidSession} session Solid session
     * @param {IriString} containerUrl Container URL
     * @returns {WebsocketNotification} Open websocket
     */
    createNotificationListener(session: SolidSession, containerUrl: IriString): WebsocketNotification {
        const websocket = new WebsocketNotification(containerUrl, { fetch: session ? session.fetch : fetch });
        websocket.on('message', (message) => {
            console.log(message);
        });
        websocket.connect();
        return websocket;
    }

    /**
     * Check if something is an object
     *
     * @param {any} item Item to check for object
     * @returns {boolean} Is an object
     */
    private _isObject(item: any) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * Deep merge objects
     *
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
     *
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
     *
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
     *
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
     *
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
     *
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
     *
     * @param {SolidProfileObject} object Data object to store profile information for
     * @returns {Promise<void>} Promise of storing
     */
    storeProfile(object: SolidProfileObject): Promise<SolidProfileObject> {
        return new Promise((resolve, reject) => {
            const key = `${SolidService.PREFIX}:webId:${object.webId}`;
            this.set(key, object.sessionId)
                .then(() => {
                    return this.findSessionByWebId(object.webId);
                })
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
                    setStringNoLocale(profile, vcard.fn, object.displayName);
                    resolve(object);
                })
                .catch(reject);
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
            this.driver
                .findByUID(key)
                .then((s) => resolve(s as string))
                .catch(() => resolve(undefined));
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
            this.driver
                .insert(key, value)
                .then(() => resolve())
                .catch(reject);
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
            this.driver
                .delete(key)
                .then(resolve)
                .catch(() => resolve(undefined));
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
            this.get(key)
                .then((sessionId) => {
                    if (!sessionId) {
                        resolve(undefined);
                        return;
                    }
                    return this.findSessionById(sessionId);
                })
                .then(resolve)
                .catch(reject);
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
            this.get(key)
                .then((sessionId) => {
                    return this.findSessionById(sessionId);
                })
                .then(resolve)
                .catch(reject);
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
            const key = `${prefix}:${
                object instanceof DataObject || object instanceof DataFrame ? object.uid : object
            }`;
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
    /**
     * Data service driver to use for key:value pairs
     * In a browser this should be @openhps/localstorage
     */
    dataServiceDriver?: DataServiceDriver<string, String>;
}

export type SolidSession = BrowserSession | NodeSession;

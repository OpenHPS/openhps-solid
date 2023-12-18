import { DataFrame, DataObject, Model, Constructor, FindOptions, FilterQuery } from '@openhps/core';
import { SolidService, SolidSession } from './SolidService';
import { getSolidDataset, removeThing, saveSolidDatasetAt, Thing } from '@inrupt/solid-client';
import {
    RDFSerializer,
    Store,
    SPARQLDataDriver,
    SPARQLDriverOptions,
    Bindings,
    IriString,
    Subject,
} from '@openhps/rdf';
import type { QueryStringContext } from '@comunica/types';
import { QueryEngine } from './QueryEngine';

export class SolidDataDriver<T extends DataObject | DataFrame> extends SPARQLDataDriver<T> {
    public model: Model;
    // Solid service
    service: SolidService;
    protected options: SolidDataDriverOptions<T>;

    constructor(dataType: Constructor<T>, options?: SolidDataDriverOptions<T>) {
        super(dataType, options);
        this.options.engine = require('./engine-default'); // eslint-disable-line
        this.engine = new QueryEngine(this.options.engine);
        this.options.lenient = true;
        this.options.uriPrefix = this.options.uriPrefix || '/openhps';
        this.options.serialize = defaultThingSerializer;
        this.options.deserialize = defaultThingDeserializer;

        this.once('build', this._initService.bind(this));
    }

    private async _initService(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.model) {
                return resolve();
            }
            this.service = this.model.findService(SolidService);
            if (!this.service) {
                return reject(new Error(`Unable to find SolidDataService!`));
            }
            resolve();
        });
    }

    queryQuads(query: string, session?: SolidSession, options?: Partial<QueryStringContext>): Promise<Store> {
        if (session) {
            return super.queryQuads(query, {
                '@comunica/actor-http-inrupt-solid-client-authn:session': session,
                sources: [session.info.webId],
                lenient: true,
                ...options,
            });
        } else {
            return super.queryQuads(query, options);
        }
    }

    queryBindings(query: string, session?: SolidSession, options?: Partial<QueryStringContext>): Promise<Bindings[]> {
        if (session) {
            return super.queryBindings(query, {
                '@comunica/actor-http-inrupt-solid-client-authn:session': session,
                sources: [session.info.webId],
                lenient: true,
                ...options,
            });
        } else {
            return super.queryBindings(query, options);
        }
    }

    findByUID(id: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.service
                .findSessionByObjectUID(this.dataType, id)
                .then((session: SolidSession) => {
                    return this.service.getThing(session, `/${this.options.uriPrefix}/${id}`);
                })
                .then((thing) => {
                    const deserialized = this.options.deserialize(thing);
                    resolve(deserialized);
                })
                .catch(reject);
        });
    }

    findOne(query: SolidFilterQuery<T>, options: FindOptions = {}): Promise<T> {
        return this.service
            .findSessionByWebId(query.webId)
            .then((session) => {
                return this.service.getThing(session, query.uri);
            })
            .then((thing) => {
                const quads = RDFSerializer.serializeToQuads(thing);
                const store = new Store(quads);
                return super.findOne(query.query, options, {
                    source: store,
                });
            });
    }

    findAll(query: SolidFilterQuery<T>, options: FindOptions = {}): Promise<T[]> {
        return this.service
            .findSessionByWebId(query.webId)
            .then((session) => {
                return this.service.getThing(session, query.uri);
            })
            .then((thing) => {
                const quads = RDFSerializer.serializeToQuads(thing);
                const store = new Store(quads);
                return super.findAll(query.query, options, {
                    source: store,
                });
            });
    }

    count(query: SolidFilterQuery<T>): Promise<number> {
        return this.service
            .findSessionByWebId(query.webId)
            .then((session) => {
                return this.service.getThing(session, query.uri);
            })
            .then((thing) => {
                const quads = RDFSerializer.serializeToQuads(thing);
                const store = new Store(quads);
                return super.count(query.query, {
                    source: store,
                });
            });
    }

    insert(_, object: T): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!object.webId) {
                if (this.service.session) {
                    object.webId = this.service.session.info.webId;
                } else {
                    return reject(new Error(`Unable to store data object or frame without WebID!`));
                }
            }
            this.service
                .findSessionByWebId(object.webId)
                .then(async (session) => {
                    if (!session) {
                        reject(new Error(`Unable to find solid session for ${object.webId}!`));
                        return;
                    }
                    if (!session.info.isLoggedIn) {
                        reject(new Error(`Solid session is not logged in!`));
                        return;
                    }
                    // Link the object
                    this.service.linkSession(object, session.info.sessionId);
                    const podURL = await this.service.getPodUrl(session);
                    const items: Thing[] = this.options.serialize(object, podURL);
                    if (items.length === 0) {
                        reject(new Error(`Unable to serialize object to RDF!`));
                        return;
                    }
                    const documentURL = new URL(items[0].url);
                    documentURL.hash = '';
                    this.service
                        .getDataset(session, documentURL.href)
                        .then((dataset) => {
                            let promise = Promise.resolve(dataset);
                            for (let i = 0; i < items.length; i++) {
                                promise = promise.then(
                                    (dataset) =>
                                        new Promise((resolve, reject) => {
                                            this.service
                                                .setThing(session, items[i], dataset)
                                                .then((dataset) => {
                                                    resolve(dataset);
                                                })
                                                .catch(reject);
                                        }),
                                );
                            }
                            return promise;
                        })
                        .then((dataset) => {
                            return this.service.saveDataset(session, dataset, documentURL.href);
                        })
                        .then(() => {
                            resolve(object);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    delete(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.service
                .findSessionByObjectUID(this.dataType, id)
                .then((session) => {
                    if (!session) {
                        reject(new Error(`Unable to find solid session for ${this.dataType.name} with id '${id}'!`));
                        return;
                    }
                    // Unlink the object
                    this.service.unlinkSession(id);
                    // Delete from Pod
                    const profileDocumentUrl = new URL(session.info.webId);
                    profileDocumentUrl.hash = '';
                    return getSolidDataset(profileDocumentUrl.href, {
                        fetch: session.fetch,
                    });
                })
                .then((dataset) => {
                    removeThing(dataset, '');
                    return saveSolidDatasetAt('', dataset);
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    deleteAll(): Promise<void> {
        throw new Error(`Not supported with SolidDataDriver!`);
    }
}

export interface SolidDataDriverOptions<T> extends SPARQLDriverOptions {
    /**
     * Serialize the object to an RDF thing
     */
    serialize?: (obj: T, baseURI?: IriString) => Thing[];
    /**
     * Deserialize the RDF thing to instance
     */
    deserialize?: (obj: Thing) => T;
    /**
     * URI prefix
     * @default /openhps
     */
    uriPrefix?: string;
}

/**
 * @param object
 * @param baseURI
 */
export function defaultThingSerializer<T extends DataObject | DataFrame>(object: T, baseURI: IriString): Thing[] {
    return RDFSerializer.serializeToSubjects(object, baseURI);
}

/**
 * @param thing
 */
export function defaultThingDeserializer<T extends DataObject | DataFrame>(thing: Thing): T {
    return RDFSerializer.deserializeFromSubjects(thing.url as IriString, [thing as Subject]);
}

export interface SolidFilterQuery<T> {
    webId: string;
    uri: string;
    query: FilterQuery<T>;
}

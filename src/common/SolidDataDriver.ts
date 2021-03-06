import { DataFrame, DataObject, Model, Constructor } from '@openhps/core';
import { SolidService, SolidSession } from './SolidService';
import { getSolidDataset, removeThing, saveSolidDatasetAt, Thing } from '@inrupt/solid-client';
import { RDFSerializer, Store } from '@openhps/rdf/serialization';
import { SPARQLDataDriver, SPARQLDriverOptions, Bindings } from '@openhps/rdf/sparql';
import { QueryEngine } from './QueryEngine';
import type { QueryStringContext } from '@comunica/types';

export class SolidDataDriver<T extends DataObject | DataFrame> extends SPARQLDataDriver<T> {
    public model: Model;
    protected service: SolidService;
    protected options: SolidDataDriverOptions<T>;

    constructor(dataType: Constructor<T>, options?: SolidDataDriverOptions<T>) {
        super(dataType, options);
        this.options.engine = new QueryEngine();
        this.options.lenient = true;
        this.options.uriPrefix = this.options.uriPrefix || '/openhps';
        this.options.serialize = this.options.serialize || defaultThingSerializer;
        this.options.deserialize = this.options.deserialize || defaultThingDeserializer;

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

    queryQuadsSolid(query: string, session?: SolidSession, options?: Partial<QueryStringContext>): Promise<Store> {
        if (!session) {
            return Promise.reject('Solid session not provided!');
        }
        return this.queryQuads(query, {
            '@comunica/actor-http-inrupt-solid-client-authn:session': session,
            sources: [session.info.webId],
            lenient: true,
            ...options,
        });
    }

    queryBindingsSolid(
        query: string,
        session?: SolidSession,
        options?: Partial<QueryStringContext>,
    ): Promise<Bindings[]> {
        if (!session) {
            return Promise.reject('Solid session not provided!');
        }
        return this.queryBindings(query, {
            '@comunica/actor-http-inrupt-solid-client-authn:session': session,
            sources: [session.info.webId],
            lenient: true,
            ...options,
        });
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

    findOne(): Promise<T> {
        throw new Error(`Not supported with SolidDataDriver!`);
    }

    findAll(): Promise<T[]> {
        throw new Error(`Not supported with SolidDataDriver!`);
    }

    count(): Promise<number> {
        throw new Error(`Not supported with SolidDataDriver!`);
    }

    insert(id: string, object: T): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!object.webId) {
                return reject(new Error(`Unable to store data object or frame without WebID!`));
            }
            this.service
                .findSessionByWebId(object.webId)
                .then((session) => {
                    if (!session) {
                        reject(new Error(`Unable to find solid session for ${this.dataType.name} with id '${id}'!`));
                        return;
                    }
                    // Link the object
                    this.service.linkSession(object, session.info.sessionId);
                    const item: Thing = this.options.serialize(object);
                    return this.service.setThing(session, item);
                })
                .then(() => resolve(object))
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
    serialize?: (obj: T) => Thing;
    /**
     * Deserialize the RDF thing to instance
     */
    deserialize?: (obj: Thing) => T;
    /**
     * URI prefix
     *
     * @default /openhps
     */
    uriPrefix?: string;
}

/**
 * @param object
 */
export function defaultThingSerializer<T extends DataObject | DataFrame>(object: T): Thing {
    const rdfThing = RDFSerializer.serialize(object);
    return {
        type: 'Subject',
        predicates: {},
        url: rdfThing.value,
    };
}

/**
 * @param thing
 */
export function defaultThingDeserializer<T extends DataObject | DataFrame>(thing: Thing): T {
    return undefined;
}

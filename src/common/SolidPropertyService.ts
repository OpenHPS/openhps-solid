import { DataService } from '@openhps/core';
import {
    Property,
    RDFSerializer,
    rdfs,
    sosa,
    ssn,
    IriString,
    RDFBuilder,
    DataFactory,
    SerializableThing,
    Observation,
} from '@openhps/rdf';
import { SolidProfileObject } from './SolidProfileObject';
import { SolidDataDriver, SolidFilterQuery } from './SolidDataDriver';
import { SolidService, SolidSession } from './SolidService';

import { EventStream } from '../models/ldes';
import { Node } from '../models/tree';
import { tree } from '../terms';
import { GreaterThanOrEqualToRelation } from '../models/tree/Relation';
import { Collection } from '../models/tree/Collection';
import { isContainer } from '@inrupt/solid-client';

/**
 * Default filter function for nodes
 * This is the function that splits data over nodes based on the amount of members,
 * date or other properties.
 * @param node Tree node to filter
 */
function defaultFilter(node: Node): boolean {
    // Filter false if node has 50 or more children
    return node.collection ? node.collection.members.length < 50 : true;
}

/**
 * Solid property service
 * @see {@link https://woutslabbinck.github.io/LDESinLDP/}
 */
export class SolidPropertyService extends DataService<string, any> {
    protected driver: SolidDataDriver<any>;
    protected filter: (node: Node) => boolean;

    /**
     * Create a new Solid property service
     * @param filter Filter function to determine if a node should be used as the parent node
     */
    constructor(filter?: (node: Node) => boolean) {
        super(
            new SolidDataDriver(undefined, {
                sources: [undefined],
                lenient: true,
            }),
        );
        this.filter = filter ?? defaultFilter;
    }

    get session(): SolidSession {
        return this.service.session;
    }

    set service(service: SolidService) {
        this.driver.service = service;
    }

    get service(): SolidService {
        return this.driver.service;
    }

    /**
     * Fetch all properties linked to a profile
     * @param {SolidSession} session Solid session
     * @param {SolidProfileObject} profile Profile object
     * @returns {Promise<Property[]>} Property promise
     */
    fetchProperties(session: SolidSession, profile: SolidProfileObject): Promise<Property[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT DISTINCT ?property ?name WHERE {
                ?me <${ssn.hasProperty}> ?property .
                OPTIONAL {
                    ?property <${rdfs.label}> ?name .
                }
                FILTER(?me = <${profile.webId}>)
            }`;
            this.driver
                .queryBindings(query, session, {
                    sources: [profile.webId],
                    lenient: true,
                })
                .then((bindings) => {
                    const properties: Property[] = [];
                    bindings.forEach((binding) => {
                        const url = binding.get('property').value as IriString;
                        const name = binding.has('name') ? binding.get('name').value : undefined;
                        const description = binding.has('description') ? binding.get('description').value : undefined;
                        const property = new Property();
                        property.id = url;
                        property.label = name;
                        property.description = description;
                        properties.push(property);
                    });
                    resolve(properties);
                })
                .catch(reject);
        });
    }

    /**
     * Create a new property
     * @param {SolidSession} session
     * @param {Property} property
     * @returns
     */
    createProperty(session: SolidSession, property: Property): Promise<IriString> {
        return new Promise((resolve, reject) => {
            const propertyContainer = this.getPropertyContainer(property);

            if (!property.id.endsWith('/property.ttl')) {
                property.id = `${property.id.replace(/\/$/, '')}/property.ttl` as IriString;
            }

            // Root dataset for the property
            this.service
                .getDatasetStore(session, session.info.webId)
                .then((store) => {
                    const thing = RDFSerializer.quadsToThing(DataFactory.namedNode(session.info.webId), store);
                    const builder = RDFBuilder.fromSerialized(thing);
                    // Add property reference to profile
                    builder.add(ssn.hasProperty, property.id);
                    const changelog = builder.build(true);
                    let dirty = false;
                    if (changelog.additions.length > 0) {
                        dirty = true;
                        store.addQuads(changelog.additions);
                    }
                    if (changelog.deletions.length > 0) {
                        dirty = true;
                        store.removeQuads(changelog.deletions);
                    }
                    // Update thing when modified
                    if (dirty) {
                        return this.service.saveDataset(session, session.info.webId, store) as Promise<any>;
                    } else {
                        return Promise.resolve();
                    }
                })
                .then(() => {
                    // Verify if the property container exists
                    return this.service.getDataset(session, propertyContainer.href);
                })
                .then((dataset) => {
                    if (dataset) {
                        resolve(property.id as IriString);
                        return;
                    }
                    // Create a new property container
                    return this.service.createContainer(session, propertyContainer.href as IriString);
                })
                .then(() => {
                    // Create a new property dataset
                    return Promise.all([
                        this.service.getDatasetStore(session, `${propertyContainer.href}property.ttl`),
                        this.service.getDatasetStore(session, `${propertyContainer.href}.meta`),
                    ]);
                })
                .then(([store, meta]) => {
                    // Add the property
                    store.addQuads(RDFSerializer.serializeToQuads(property));
                    // Add the eventstream to the metadata
                    const eventStreamURL = new URL(`${propertyContainer.href}property.ttl`);
                    eventStreamURL.hash = 'EventStream';
                    const viewURL = new URL(`${propertyContainer.href}property.ttl`);
                    viewURL.hash = 'root';
                    const stream = new EventStream(eventStreamURL.href as IriString);
                    stream.setTimestampPath(sosa.resultTime);
                    stream.view = new Node(viewURL.href as IriString);
                    meta.addQuads(RDFSerializer.serializeToQuads(stream));
                    store.addQuads(RDFSerializer.serializeToQuads(stream.view));
                    return this.service
                        .saveDataset(session, `${propertyContainer.href}property.ttl`, store)
                        .then(() => this.service.saveDataset(session, `${propertyContainer.href}.meta`, meta));
                })
                .then(() => {
                    resolve(property.id as IriString);
                })
                .catch(reject);
        });
    }

    protected createTreeNode(session: SolidSession, node: Node, collection?: Collection): Promise<Node> {
        return new Promise((resolve, reject) => {
            const nodeURL = new URL(node.id);
            nodeURL.hash = '';
            const datasetURL = `${nodeURL.href}${isContainer(nodeURL.href) ? `${nodeURL.href.endsWith('/') ? '' : '/'}.meta` : ''}`;
            this.service
                .getDatasetStore(session, datasetURL)
                .then((dataset) => {
                    dataset.addQuads(RDFSerializer.serializeToQuads(node, `${nodeURL.href}#` as IriString));
                    if (collection) {
                        dataset.addQuads(RDFSerializer.serializeToQuads(collection, `${nodeURL.href}#` as IriString));
                    }
                    return this.service.saveDataset(session, datasetURL, dataset);
                })
                .then(() => resolve(node))
                .catch(reject);
        });
    }

    protected fetchTreeNode(session: SolidSession, node: SerializableThing, collection?: IriString): Promise<Node> {
        return new Promise((resolve, reject) => {
            const nodeURL = new URL(node.id);
            nodeURL.hash = '';
            const datasetURL = `${nodeURL.href}${isContainer(nodeURL.href) ? `${nodeURL.href.endsWith('/') ? '' : '/'}.meta` : ''}`;
            this.service
                .getDatasetStore(session, datasetURL)
                .then((dataset) => {
                    const nodeThing = RDFSerializer.quadsToThing(DataFactory.namedNode(node.id), dataset);
                    if (nodeThing) {
                        const deserializedNode: Node = RDFSerializer.deserializeFromStore(
                            DataFactory.namedNode(node.id),
                            dataset,
                        );
                        const deserializedCollection: Collection = collection
                            ? RDFSerializer.deserializeFromStore(DataFactory.namedNode(collection), dataset)
                            : undefined;
                        if (deserializedNode) {
                            deserializedNode.collection = deserializedCollection;
                            resolve(deserializedNode);
                        } else {
                            reject(new Error('Node could not be deserialized'));
                        }
                    } else {
                        reject(new Error('Node not found'));
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Find the root node of a property
     * @param session Solid session
     * @param property Property
     * @returns {Promise<Node>} Root node
     */
    findRootNode(session: SolidSession, property: Property): Promise<Node> {
        return new Promise((resolve, reject) => {
            const propertyContainer = this.getPropertyContainer(property);

            Promise.all([this.service.getDatasetStore(session, `${property.id}`)])
                .then(async ([store]) => {
                    // Get the root node of the dataset
                    const bindings = await this.driver.queryBindings(
                        `SELECT DISTINCT ?node WHERE {
                        ?node a <${tree.Node}> .   
                    }`,
                        undefined,
                        {
                            sources: [store],
                        },
                    );
                    if (bindings.length === 0) {
                        // No root node
                        resolve(undefined);
                        return;
                    }
                    const rootNode: Node = RDFSerializer.deserializeFromStore(
                        DataFactory.namedNode(bindings[0].get('node').value as IriString),
                        store,
                    );
                    if (!rootNode) {
                        // Root node not found
                        resolve(undefined);
                        return;
                    }
                    resolve(rootNode);
                })
                .catch(reject);
        });
    }

    protected getPropertyContainer(property: Property): URL {
        const propertyContainer = new URL(property.id);
        propertyContainer.hash = '';
        if (property.id.endsWith('/property.ttl')) {
            // Ensure the property container does not include the property.ttl
            propertyContainer.pathname = propertyContainer.pathname.replace(/\/property\.ttl$/, '');
        }
        if (!propertyContainer.href.endsWith('/')) {
            propertyContainer.pathname += '/';
        }
        return propertyContainer;
    }

    /**
     * Add an observation to a property
     * @param session
     * @param property
     * @param observation
     * @returns
     */
    addObservation(session: SolidSession, property: Property, observation: Observation): Promise<void> {
        return new Promise((resolve, reject) => {
            const propertyContainer = this.getPropertyContainer(property);

            this.findRootNode(session, property)
                .then(async (rootNode) => {
                    // Create/repair root node if it does not exist
                    if (!rootNode) {
                        await this.createProperty(session, property);
                        // After fixing it we still need to fetch it
                        rootNode = await this.findRootNode(session, property);
                        if (!rootNode) {
                            throw new Error('Root node could not be created');
                        }
                    }

                    // Check relations to make sure there is no issue
                    for (const relation of rootNode.relations) {
                        if (!relation.node) {
                            console.error(relation);
                            throw new Error('Relation node not found');
                        }
                        if (!relation.value) {
                            console.error(relation);
                            throw new Error('Relation value not found');
                        }
                    }

                    // Child nodes are references and not stored in the dataset
                    // Fetch the last node
                    let childNode = rootNode.getChildNode(observation.resultTime);
                    if (childNode) {
                        // False when first node
                        childNode = await this.fetchTreeNode(session, childNode, property.id as IriString);
                        childNode = this.filter(childNode) ? childNode : undefined;
                    }

                    if (!childNode) {
                        // Create node
                        childNode = new Node();
                        childNode.id = `${propertyContainer.href}${observation.resultTime.getTime()}/` as IriString;
                        await this.service.createContainer(session, childNode.id);

                        // Add relation from root node to child node
                        rootNode.relations.push(
                            new GreaterThanOrEqualToRelation(observation.resultTime, childNode).setPath(
                                sosa.resultTime,
                            ),
                        );

                        // Save root node
                        await this.createTreeNode(session, rootNode);
                    }

                    observation.id = `${childNode.id}${this.generateUUID()}.ttl` as IriString;
                    const collection = new Collection(propertyContainer.href as IriString);
                    collection.members.push(observation);
                    // Save child node
                    await this.createTreeNode(session, childNode, collection);
                    // Save observation
                    return this.service.saveDataset(
                        session,
                        `${observation.id}`,
                        RDFSerializer.serializeToStore(observation),
                    );
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Fetch all observations for a property
     * @param session
     * @param property
     * @param after
     * @returns
     */
    fetchObservations(session: SolidSession, property: Property, after?: Date): Promise<Observation[]> {
        return new Promise((resolve, reject) => {
            this.findAll(
                {
                    query: {
                        ...(after
                            ? {
                                  resultTime: {
                                      $gte: after,
                                  },
                              }
                            : {}),
                    },
                    uri: property.id,
                    webId: session.info.webId,
                } as SolidFilterQuery<Observation>,
                {
                    dataType: Observation,
                },
            )
                .then((observations) => {
                    resolve(observations);
                })
                .catch(reject);
        });
    }
}

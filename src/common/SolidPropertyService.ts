import { DataService } from '@openhps/core';
import { Property, RDFSerializer, dcterms, rdfs, sosa, ssn, IriString, RDFBuilder, DataFactory } from '@openhps/rdf';
import { SolidProfileObject } from './SolidProfileObject';
import { SolidDataDriver, SolidFilterQuery } from './SolidDataDriver';
import { SolidService, SolidSession } from './SolidService';
import { Observation } from '@openhps/rdf/models';
import { EventStream } from '../models/ldes';
import { Node } from '../models/tree';
import { tree } from '../terms';
import { GreaterThanOrEqualToRelation } from '../models/tree/Relation';
import { Collection } from '../models/tree/Collection';

export class SolidPropertyService extends DataService<string, any> {
    protected driver: SolidDataDriver<any>;

    constructor() {
        super(
            new SolidDataDriver(undefined, {
                sources: [undefined],
                lenient: true,
            }),
        );
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
            const propertyContainer = new URL(property.id);
            propertyContainer.hash = '';
            // Root dataset for the property
            property.id = `${property.id}/property.ttl` as IriString;
            this.service
                .getDatasetStore(session, session.info.webId)
                .then((store) => {
                    const thing = RDFSerializer.quadsToThing(DataFactory.namedNode(session.info.webId), store);
                    const builder = RDFBuilder.fromSerialized(thing);
                    builder.add(ssn.hasProperty, `${propertyContainer.href}/property.ttl`);
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
                        return this.service.saveDatasetStore(session, session.info.webId, store) as Promise<any>;
                    } else {
                        return Promise.resolve();
                    }
                })
                .then(() => {
                    // Verify if the property container exists
                    return this.service.getDataset(session, propertyContainer.href);
                }).then((dataset) => {
                    if (dataset) {
                        resolve(property.id as IriString)
                        return;
                    }
                    // Create a new property container
                    return this.service.createContainer(session, propertyContainer.href as IriString);
                }).then(() => {
                    // Create a new property dataset
                    return Promise.all([
                        this.service.getDatasetStore(session, `${propertyContainer.href}/property.ttl`),
                        this.service.getDatasetStore(session, `${propertyContainer.href}/.meta`),
                    ]);
                })
                .then(([store, meta]) => {
                    // Add the property
                    store.addQuads(RDFSerializer.serializeToQuads(property));
                    // Add the eventstream to the metadata
                    const eventStreamURL = new URL(`${propertyContainer.href}/property.ttl`);
                    eventStreamURL.hash = 'EventStream';
                    const viewURL = new URL(`${propertyContainer.href}/property.ttl`);
                    viewURL.hash = 'root';
                    const stream = new EventStream(eventStreamURL.href as IriString);
                    stream.setTimestampPath(sosa.resultTime);
                    stream.view = new Node(viewURL.href as IriString);
                    meta.addQuads(RDFSerializer.serializeToQuads(stream));
                    store.addQuads(RDFSerializer.serializeToQuads(stream.view));
                    return this.service.saveDatasetStore(session, `${propertyContainer.href}/property.ttl`, store)
                        .then(() => this.service.saveDatasetStore(session, `${propertyContainer.href}/.meta`, meta));
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
            const isContainer = !nodeURL.href.endsWith('.ttl');
            const datasetURL = `${nodeURL.href}${isContainer ? `${nodeURL.href.endsWith('/') ? '' : '/'}.meta` : ''}`
            this.service.getDatasetStore(session, datasetURL).then(dataset => {
                dataset.addQuads(RDFSerializer.serializeToQuads(node));
                if (collection) {
                    dataset.addQuads(RDFSerializer.serializeToQuads(collection));
                }
                return this.service.saveDatasetStore(session, datasetURL, dataset);
            }).then(() => resolve(node)).catch(reject);
        });
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
            Promise.all([
                this.service.getDatasetStore(session, `${property.id}/property.ttl`),
                this.service.getDatasetStore(session, `${property.id}/.meta`),
            ])
                .then(async ([store, meta]) => {
                    // Get the root node of the dataset
                    const bindings = await this.driver.queryBindings(`SELECT DISTINCT ?node WHERE {
                        ?node a <${tree.Node}> .   
                    }`, undefined, {
                        sources: [store]
                    });
                    if (bindings.length === 0) {
                        // No root node
                        return reject(new Error('Root node not found'));
                    } 
                    const rootNode: Node = RDFSerializer.deserializeFromStore(DataFactory.namedNode(bindings[0].get('node').value as IriString), store);
                    if (!rootNode) {
                        // Root node not found
                        return reject(new Error('Root node not found, but it was in the query result'));
                    }
                    let childNode = rootNode.getChildNode(observation.resultTime);
                    if (!childNode) {
                        // Create node
                        childNode = new Node();
                        childNode.id = `${property.id}/${observation.resultTime.getTime()}/` as IriString;
                        await this.service.createContainer(session, childNode.id);

                        // Add relation from root node to child node
                        rootNode.relations.push(new GreaterThanOrEqualToRelation(observation.resultTime, childNode)
                            .setPath(sosa.resultTime));
                        // Save root node
                        await this.createTreeNode(session, rootNode);
                    }

                    observation.id = `${childNode.id}/${this.generateUUID()}.ttl` as IriString;
                    const collection = new Collection(property.id);
                    collection.members.push(observation);
                    // Save child node
                    await this.createTreeNode(session, childNode, collection);
                    // Save observation
                    return this.service.saveDatasetStore(session, `${observation.id}`, RDFSerializer.serializeToStore(observation));
                }).then(() => {
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

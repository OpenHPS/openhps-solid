import { DataService } from '@openhps/core';
import { Property, RDFSerializer, dcterms, rdfs, sosa, ssn, IriString, RDFBuilder } from '@openhps/rdf';
import { SolidProfileObject } from './SolidProfileObject';
import { SolidDataDriver, SolidFilterQuery } from './SolidDataDriver';
import { SolidService, SolidSession } from './SolidService';
import { Observation } from '@openhps/rdf/models';

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
            this.service.getThing(session, session.info.webId).then((thing) => {
                const builder = RDFBuilder.fromSerialized(RDFSerializer.subjectsToThing([thing], thing.url as IriString));
                builder.add(ssn.hasProperty, property.id);
                const changelog = builder.build(true);
                console.log(changelog);
                resolve(property.id as IriString);
            }).catch(reject);
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
            this.findAll({
                query: {
                    ...(after ? {
                        resultTime: {
                            $gte: after,
                        }
                    } : {})
                },
                uri: property.id,
                webId: session.info.webId,
            } as SolidFilterQuery<Observation>, {
                dataType: Observation,
            }).then((observations) => {
                resolve(observations);
            }).catch(reject);
        });
    }
}

import { DataService } from '@openhps/core';
import { Property, RDFSerializer, ssn } from '@openhps/rdf';
import { SolidProfileObject } from './SolidProfileObject';
import { SolidDataDriver } from './SolidDataDriver';
import { SolidService, SolidSession } from './SolidService';
import { IriString } from '@inrupt/solid-client';

export class SolidPropertyService extends DataService<string, any> {
    protected driver: SolidDataDriver<any>;

    constructor() {
        super(
            new SolidDataDriver(undefined, {
                sources: [],
                lenient: true,
            }),
        );
    }

    protected get service(): SolidService {
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
            this.driver
                .queryBindings(
                    `
                SELECT ?property WHERE {
                    ?property <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${ssn.Property}>
                }
            `,
                    session,
                    {
                        sources: [profile.webId],
                        lenient: true,
                    },
                )
                .then((bindings) => {
                    console.log(bindings);
                    const properties: Property[] = [];

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
            const thing = RDFSerializer.serialize(property);
            this.service
                .createThing(session, thing as any)
                .then((dataset) => {
                    // Link the property to the profile
                    resolve(thing.value);
                })
                .catch(reject);
        });
    }
}

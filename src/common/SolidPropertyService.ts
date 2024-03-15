import { DataService } from '@openhps/core';
import { Property } from '@openhps/rdf';
import { SolidProfileObject } from './SolidProfileObject';
import { SolidDataDriver } from './SolidDataDriver';

export class SolidPropertyService extends DataService<string, any> {
    protected driver: SolidDataDriver<any>;

    constructor() {
        super(new SolidDataDriver(undefined, {
            sources: [],
            lenient: true 
        }));
    }

    /**
     * Fetch all properties linked to a profile
     * @param {SolidProfileObject} profile Profile object
     * @returns {Promise<Property[]>} Property promise
     */
    fetchProperties(profile: SolidProfileObject): Promise<Property[]> {
        return new Promise((resolve, reject) => {
            this.driver.queryBindings(`
            `).then((bindings) => {

            }).catch(reject);
        });
    }
}

import { DataFrame, DataObject, DataServiceDriver, DataServiceOptions, Model } from "@openhps/core";
import { SolidDataService, SolidSession } from "./SolidDataService";
import {
    getSolidDataset,
    getThing,
    setThing,
    getStringNoLocale,
    setStringNoLocale,
    saveSolidDatasetAt
} from "@inrupt/solid-client";

export class SolidDataDriver<T extends DataObject | DataFrame> extends DataServiceDriver<string, T> {
    public model: Model;
    protected service: SolidDataService;
    protected options: SolidDataDriverOptions;

    constructor(dataType: new (...args: any[]) => T, options?: SolidDataDriverOptions) {
        super(dataType, options);

        this.once('build', this._initService.bind(this));
    }

    private async _initService(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.service = this.model.findDataService(SolidDataService);
            if (!this.service) {
                return reject(new Error(`Unable to find SolidDataService!`));
            }
            resolve();
        });
    }

    findByUID(id: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.service.findSessionByObjectUID(this.dataType, id).then((session: SolidSession) => {
                if (!session) {
                    reject(new Error(`Unable to find solid session for ${this.dataType.name} with id '${id}'!`));
                    return;
                }
                return getSolidDataset("", {
                    fetch: session.fetch,
                });
            })
            .then(dataset => {
                const thing = getThing(dataset, "");
                console.log(thing)
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
            this.service.findSessionByWebId(object.webId).then(session => {
                if (!session) {
                    reject(new Error(`Unable to find solid session for ${this.dataType.name} with id '${id}'!`));
                    return;
                }
                // Link the object
                this.service.linkSession(object, session.info.sessionId);
                // Insert into Pod
                return getSolidDataset("", {
                    fetch: session.fetch,
                });
            }).then(dataset => {
                
            }).catch(reject);
        });
    }

    delete(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.service.findSessionByObjectUID(this.dataType, id).then(session => {
                if (!session) {
                    return reject(new Error(`Unable to find solid session for ${this.dataType.name} with id '${id}'!`));
                }
                // Unlink the object
                this.service.unlinkSession(id);
                // Delete from Pod
                
            }).catch(reject);
        });
    }

    deleteAll(): Promise<void> {
        throw new Error(`Not supported with SolidDataDriver!`);
    }

}

export interface SolidDataDriverOptions extends DataServiceOptions {

}

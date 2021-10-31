import { DataFrame, DataObject, DataServiceDriver, DataServiceOptions, Model } from "@openhps/core";
import { SolidDataService, SolidSession } from "./SolidDataService";
import {
    getSolidDataset,
    getThing,
    setThing,
    removeThing,
    saveSolidDatasetAt,
    Thing
} from "@inrupt/solid-client";

export class SolidDataDriver<T extends DataObject | DataFrame> extends DataServiceDriver<string, T> {
    public model: Model;
    protected service: SolidDataService;
    protected options: SolidDataDriverOptions<T>;

    constructor(dataType: new (...args: any[]) => T, options?: SolidDataDriverOptions<T>) {
        super(dataType, options);
        this.options.serialize = this.options.serialize || defaultThingSerializer;
        this.options.deserialize = this.options.deserialize || defaultThingDeserializer;

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
                dataset = setThing(dataset, this.options.serialize(object));
                return saveSolidDatasetAt("", dataset);
            }).then(() => resolve(object)).catch(reject);
        });
    }

    delete(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.service.findSessionByObjectUID(this.dataType, id).then(session => {
                if (!session) {
                    reject(new Error(`Unable to find solid session for ${this.dataType.name} with id '${id}'!`));
                    return;
                }
                // Unlink the object
                this.service.unlinkSession(id);
                // Delete from Pod
                return getSolidDataset("", {
                    fetch: session.fetch,
                });
            }).then(dataset => {
                removeThing(dataset, "");
                return saveSolidDatasetAt("", dataset);
            }).then(() => resolve()).catch(reject);
        });
    }

    deleteAll(): Promise<void> {
        throw new Error(`Not supported with SolidDataDriver!`);
    }

}

export interface SolidDataDriverOptions<T> extends DataServiceOptions {
    serialize?: (obj: T) => Thing;
    deserialize?: (obj: Thing) => T;
}

export function defaultThingSerializer<T extends DataObject | DataFrame>(object: T): Thing {
    return {
        url: "",
        type: "Subject",
        predicates: undefined 
    };
}

export function defaultThingDeserializer<T extends DataObject | DataFrame>(thing: Thing): T {
    return undefined;
}

import {
    getSolidDataset,
    getThing,
    setThing,
    getStringNoLocale,
    setStringNoLocale,
    saveSolidDatasetAt
} from "@inrupt/solid-client";
import { 
    DataObject,
    DataServiceDriver, 
    FilterQuery 
} from "@openhps/core";
import { SolidDataObject } from "./SolidDataObject";
import { Session } from "@inrupt/solid-client-authn-browser";

export class SolidDataClient extends DataServiceDriver<string, DataObject> {
    private _sessions: Map<string, Session> = new Map();
    protected options: SolidDataClientOptions;

    constructor(options?: SolidDataClientOptions) {
        super(DataObject);
        this.options = options || {};
    }

    login(object: SolidDataObject): Promise<SolidDataObject> {
        return new Promise((resolve, reject) => {
            if (!this._sessions.has(object.uid)) {
                this._sessions.set(object.uid, new Session());
            }
            const session = this._sessions.get(object.uid);
            if (!session.info.isLoggedIn) {
                session.login({
                    oidcIssuer: object.oidcIssuer,
                    clientName: this.options.clientName,
                    redirectUrl: this.options.redirectUrl
                });
            }
        });
    }

    findByUID(id: string): Promise<DataObject> {
        return this.findOne({ _id: id });
    }

    findOne(query?: FilterQuery<DataObject>): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            
        });
    }

    findAll(query?: FilterQuery<DataObject>): Promise<DataObject[]> {
        return new Promise<DataObject[]>((resolve, reject) => {
            
        });
    }

    insert(id: string, object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            
        });
    }

    delete(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            
        });
    }

    deleteAll(query?: FilterQuery<DataObject>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            
        });
    }

    count(query?: FilterQuery<DataObject>): Promise<number> {
        return new Promise((resolve, reject) => {
            
        });
    }
}

export interface SolidDataClientOptions {
    clientName?: string;
    redirectUrl?: string;
}

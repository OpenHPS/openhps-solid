import { DataObjectService, MemoryDataService } from "@openhps/core";
import { SymbolicSpace } from "@openhps/geospatial";
import * as Spaces from '../models/Spaces';

export class BuildingController {
    protected service: DataObjectService<SymbolicSpace<any>>;

    constructor() {
        this.service = new DataObjectService(new MemoryDataService(SymbolicSpace));
    }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.service.emitAsync('build').then(() => {
                return Promise.all(            Object.keys(Spaces).map(key => {
                    const space = Spaces[key] as SymbolicSpace<any>;
                    return this.service.insertObject(space);
                }));
            }).then(() => {
                resolve();
            }).catch(reject);
        })
    }

    findByUID(uid: string): Promise<SymbolicSpace<any>> {
        return this.service.findByUID(uid);
    }
}

import { AbsolutePosition, DataObjectService, MemoryDataService } from "@openhps/core";
import { SymbolicSpace } from "@openhps/geospatial";
import * as Spaces from '../models/Spaces';

/**
 * Building controller
 */
export class BuildingController {
    protected service: DataObjectService<SymbolicSpace<AbsolutePosition>>;

    constructor() {
        this.service = new DataObjectService(new MemoryDataService(SymbolicSpace));
    }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.service.emitAsync('build').then(() => {
                return Promise.all(Object.keys(Spaces).map(key => {
                    const space = Spaces[key] as SymbolicSpace<AbsolutePosition>;
                    return this.service.insertObject(space);
                }));
            }).then(() => {
                resolve();
            }).catch(reject);
        })
    }

    /**
     * Find a building by its unique identifier
     *
     * @param {string} uid Building UID 
     * @returns 
     */
    findByUID(uid: string): Promise<SymbolicSpace<AbsolutePosition>> {
        return this.service.findByUID(uid);
    }
}

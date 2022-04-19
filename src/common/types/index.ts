import { DataObject, DataFrame } from '@openhps/core'; // eslint-disable-line @typescript-eslint/no-unused-vars
import '@openhps/rdf/serialization';

declare module '@openhps/core/dist/types/data/object/DataObject' {
    export interface DataObject {
        /**
         * Solid Web Identifier
         *
         * @returns {string} URL WebID identifier
         */
        webId?: string;
    }
}

declare module '@openhps/core/dist/types/data/DataFrame' {
    export interface DataFrame {
        /**
         * Solid Web Identifier
         *
         * @returns {string} URL WebID identifier
         */
        webId?: string;
    }
}

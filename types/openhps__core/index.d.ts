import { DataObject, DataFrame } from '@openhps/core';

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

import { DataObject, DataFrame } from '@openhps/core';

declare module '@openhps/core/lib/types/data/object/DataObject' {

    interface DataObject {
        /**
         * Solid Web Identifier
         *
         * @returns {string} URL WebID identifier
         */
        webId?: string;
    }

}

declare module '@openhps/core/lib/types/data/DataFrame' {

    interface DataFrame {
        /**
         * Solid Web Identifier
         *
         * @returns {string} URL WebID identifier
         */
        webId?: string;
    }

}

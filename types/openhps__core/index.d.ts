import { DataObject, DataFrame } from '@openhps/core';

declare module '@openhps/core/lib/types/data/object/DataObject' {

    interface DataObject {
        webId?: string;
    }

}

declare module '@openhps/core/lib/types/data/DataFrame' {

    interface DataFrame {
        webId?: string;
    }

}

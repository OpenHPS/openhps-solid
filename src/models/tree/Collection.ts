import { SerializableObject } from '@openhps/core';
import { tree } from '../../terms';
import { SerializableThing } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: tree.Collection,
    },
})
export class Collection extends SerializableThing {
    @SerializableArrayMember(SerializableThing, {
        rdf: {
            predicate: tree.member,
        },
    })
    members?: SerializableThing[] = [];
}

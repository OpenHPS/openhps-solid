import { SerializableArrayMember, SerializableObject } from '@openhps/core';
import { tree } from '../../terms';
import { SerializableThing } from '@openhps/rdf';
import { Relation } from './Relation';

@SerializableObject({
    rdf: {
        type: tree.Node,
    },
})
export class Node extends SerializableThing {
    @SerializableArrayMember(Relation, {
        rdf: {
            predicate: tree.relation,
        },
    })
    relations: Relation[] = [];

    @SerializableArrayMember(SerializableThing, {
        rdf: {
            predicate: tree.member,
        },
    })
    members?: SerializableThing[];
}

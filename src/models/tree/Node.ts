import { SerializableArrayMember, SerializableObject } from '@openhps/core';
import { tree } from '../../terms';
import { SerializableThing, IriString } from '@openhps/rdf';
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

    getChildNodes(): Node[] {
        return this.relations.map(r => r.node as Node);
    }

    getChildNode(value: Object): Node {
        return this.relations.find(r => r.test(value))?.node as Node;
    }
}

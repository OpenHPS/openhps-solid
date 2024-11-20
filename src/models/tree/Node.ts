import { SerializableArrayMember, SerializableMember, SerializableObject } from '@openhps/core';
import { tree } from '../../terms';
import { SerializableThing, IriString } from '@openhps/rdf';
import { Relation } from './Relation';
import { Collection } from './Collection';

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

    @SerializableMember({
        rdf: {},
    })
    collection?: Collection;

    constructor(iri?: IriString) {
        super(iri);
    }

    getChildNodes(): Node[] {
        return this.relations.map((r) => r.node as Node);
    }

    /**
     * Get child node
     * @param value
     * @returns Child node if found
     */
    getChildNode(value: object): Node {
        const relations = this.relations.filter((r) => {
            return r ? r.value && r.test(value) : false;
        });
        if (relations.length === 0) {
            return null;
        }
        // Sort the nodes by value in decending order
        // Since value can be anything, assume its either a number, date or string
        const nodes = relations
            .sort((a, b) => {
                if (typeof a.value === 'number' && typeof b.value === 'number') {
                    return a.value - b.value;
                } else if (a.value instanceof Date && b.value instanceof Date) {
                    return a.value.getTime() - b.value.getTime();
                } else {
                    return a.value.toString().localeCompare(b.value.toString());
                }
            })
            .map((r) => r.node as Node);
        // Select the node that with the highest value
        return nodes[nodes.length - 1];
    }
}

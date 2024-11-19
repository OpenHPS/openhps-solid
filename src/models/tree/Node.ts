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
        rdf: {
            
        },
    })
    collection?: Collection;
    
    constructor(iri?: IriString) {
        super(iri);
    }
    
    getChildNodes(): Node[] {
        return this.relations.map(r => r.node as Node);
    }

    /**
     * Get child node
     * @param value 
     * @param [filter] Filter function 
     * @returns Child node if found
     */
    getChildNode(value: Object, filter?: (node: Node) => boolean): Node {
        const node = this.relations.find(r => {
            return r ? r.value && r.test(value) : false
        })?.node as Node;
        if (node && filter && !filter(node)) {
            return null;
        }
        return node;
    }
}

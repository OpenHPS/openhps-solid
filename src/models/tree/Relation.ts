import { SerializableMember, SerializableObject } from '@openhps/core';
import { tree } from '../../terms';
import { RDFSerializer, SerializableNamedNode, SerializableThing, Thing } from '@openhps/rdf';
import { IriString } from '@inrupt/solid-client';
import type { Node } from './Node';

@SerializableObject({
    rdf: {
        type: tree.Relation,
    },
})
export abstract class Relation {
    @SerializableMember({
        rdf: {
            predicate: tree.node,
            serializer: false,
            deserializer: (iri: IriString) => {
                return new SerializableThing(iri as any);
            },
        }
    })
    node? : SerializableThing;

    @SerializableMember({
        rdf: {
            predicate: tree.path,
        },
    })
    path?: SerializableNamedNode;

    @SerializableMember({
        rdf: {
            predicate: tree.value,
            serializer: (value: any) => {
                return RDFSerializer.serialize(value);
            },
            deserializer: (thing: Thing) => {
                return RDFSerializer.deserialize(thing);
            }
        },
    })
    value: Object;

    constructor(value: any, node: Node) {
        this.value = value;
        this.node = node;
    }

    setPath(path: IriString): this {
        this.path = new SerializableNamedNode(path);
        return this;
    }

    abstract test(value: any): boolean;
}

@SerializableObject({
    rdf: {
        type: tree.GreaterThanOrEqualToRelation,
    },
})
export class GreaterThanOrEqualToRelation extends Relation {
    test(value: any): boolean {
        return value >= this.value;
    }
}

@SerializableObject({
    rdf: {
        type: tree.GreaterThanRelation,
    },
})
export class GreaterThanRelation extends Relation {
    test(value: any): boolean {
        return value > this.value;
    }
}

@SerializableObject({
    rdf: {
        type: tree.LessThanOrEqualToRelation,
    },
})
export class LessThanOrEqualToRelation extends Relation {
    test(value: any): boolean {
        return value <= this.value;
    }
}

@SerializableObject({
    rdf: {
        type: tree.LessThanRelation,
    },
})
export class LessThanRelation extends Relation {
    test(value: any): boolean {
        return value < this.value;
    }
}

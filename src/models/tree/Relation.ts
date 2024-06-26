import { SerializableMember, SerializableObject } from '@openhps/core';
import { tree } from '../../terms';
import { SerializableNamedNode, SerializableThing } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: tree.Relation,
    },
})
export class Relation {
    @SerializableMember({
        rdf: {
            predicate: tree.path,
        },
    })
    path?: SerializableNamedNode;

    @SerializableMember({
        rdf: {
            predicate: tree.value,
        },
    })
    value: SerializableThing;
}

@SerializableObject({
    rdf: {
        type: tree.GreaterThanOrEqualToRelation,
    },
})
export class GreaterThanOrEqualToRelation extends Relation {}

@SerializableObject({
    rdf: {
        type: tree.GreaterThanRelation,
    },
})
export class GreaterThanRelation extends Relation {}

@SerializableObject({
    rdf: {
        type: tree.LessThanOrEqualToRelation,
    },
})
export class LessThanOrEqualToRelation extends Relation {}

@SerializableObject({
    rdf: {
        type: tree.LessThanRelation,
    },
})
export class LessThanRelation extends Relation {}

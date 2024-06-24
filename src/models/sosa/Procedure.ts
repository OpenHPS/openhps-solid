import { Node, SerializableMember, SerializableObject } from '@openhps/core';
import { sosa, rdfs } from '@openhps/rdf';
import { SerializableThing } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: sosa.Procedure,
    },
})
export class Procedure extends SerializableThing { // eslint-disable-line
    @SerializableMember({
        rdf: {
            predicate: rdfs.label,
            language: 'en',
        },
    })
    label?: string;

    @SerializableMember({
        rdf: {
            predicate: rdfs.comment,
            language: 'en',
        },
    })
    comment?: string;
}
export interface Procedure extends SerializableThing, Node<any, any> {} // eslint-disable-line


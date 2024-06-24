import { SerializableMember, SerializableObject } from '@openhps/core';
import { rdfs, ssn, dcterms } from '@openhps/rdf';
import { DataFactory } from 'n3';
import { IriString, Thing } from '@openhps/rdf';
import { SerializableThing } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: ssn.Property,
    },
})
export class Property extends SerializableThing {
    @SerializableMember({
        rdf: {
            predicate: rdfs.label,
            language: 'en',
        },
    })
    label?: string;

    @SerializableMember({
        rdf: {
            predicate: [rdfs.comment, dcterms.description],
            language: 'en',
        },
    })
    description?: string;

    @SerializableMember({
        rdf: {
            predicate: ssn.isPropertyOf,
            serializer: (value: string) => DataFactory.namedNode(value),
            deserializer: (thing: Thing) => thing.value,
        },
    })
    featureOfInterest?: IriString;
}

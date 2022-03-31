import { SerializableMember, SerializableObject } from "@openhps/core";
import { sosa, rdfs, SerializableNamedNode, ssn, IriString, Thing } from "@openhps/rdf";
import { DataFactory } from 'n3';

@SerializableObject({
    rdf: {
        type: sosa.ObservableProperty
    }
})
export class ObservableProperty extends SerializableNamedNode {
    @SerializableMember({
        rdf: {
            predicate: rdfs.label,
            language: "en"
        }
    })
    label?: string;

    @SerializableMember({
        rdf: {
            predicate: rdfs.comment,
            language: "en"
        }
    })
    comment?: string;

    @SerializableMember({
        rdf: {
            predicate: ssn.isPropertyOf,
            serializer: (value: string) => (DataFactory.namedNode(value)),
            deserializer: (thing: Thing) => thing.value
        }
    })
    featureOfInterest: IriString;
}

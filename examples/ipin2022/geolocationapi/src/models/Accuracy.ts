import { SerializableMember, SerializableObject } from "@openhps/core";
import { schema, ssn, ssns } from "@openhps/rdf/vocab";
import { SerializableNamedNode } from "@openhps/rdf/serialization";
import { ObservableProperty } from "./ObservableProperty";

@SerializableObject({
    rdf: {
        type: ssns.Accuracy
    }
})
export class Accuracy extends SerializableNamedNode {
    @SerializableMember({
        rdf: {
            predicate: ssn.forProperty
        }
    })
    forProperty: ObservableProperty;

    @SerializableMember({
        rdf: {
            predicate: schema.minValue
        }
    })
    minValue: number;

    @SerializableMember({
        rdf: {
            predicate: schema.maxValue
        }
    })
    maxValue: number;

    @SerializableMember({
        rdf: {
            predicate: schema.unitCode
        }
    })
    unit: number;
}

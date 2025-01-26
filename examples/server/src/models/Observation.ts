import { SerializableArrayMember, SerializableMember, SerializableObject } from "@openhps/core";
import { sosa } from "@openhps/rdf";
import { FeatureOfInterest } from "./FeatureOfInterest";
import { ObservableProperty } from "./ObservableProperty";
import { SerializableNamedNode, xsd } from "@openhps/rdf";

@SerializableObject({
    rdf: {
        type: sosa.Observation
    }
})
export class Observation extends SerializableNamedNode {
    @SerializableMember({
        rdf: {
            predicate: sosa.resultTime,
            datatype: xsd.dateTime
        }
    })
    resultTime: Date;

    @SerializableArrayMember(FeatureOfInterest, {
        rdf: {
            predicate: sosa.hasFeatureOfInterest
        }
    })
    featuresOfInterest: FeatureOfInterest[] = [];

    @SerializableArrayMember(ObservableProperty, {
        rdf: {
            predicate: sosa.observedProperty
        }
    })
    observedProperties: ObservableProperty[] = [];
    
    @SerializableArrayMember(Object, {
        rdf: {
            predicate: sosa.hasResult
        }
    })
    results: Object[] = [];
}

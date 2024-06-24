import { DataObject, SerializableArrayMember, SerializableMember, SerializableObject } from '@openhps/core';
import { ActuableProperty } from './ActuableProperty';
import { dcterms, rdfs, ssn } from '@openhps/rdf';
import { ObservableProperty } from './ObservableProperty';
import { Property } from './Property';

@SerializableObject()
export class FeatureOfInterest extends DataObject {
    @SerializableArrayMember(ActuableProperty, {
        rdf: {
            predicate: ssn.hasProperty,
        },
    })
    actuableProperties?: ActuableProperty[];

    @SerializableArrayMember(ObservableProperty, {
        rdf: {
            predicate: ssn.hasProperty,
        },
    })
    observableProperties?: ObservableProperty[];

    get properties(): Property[] {
        return [...(this.actuableProperties ?? []), ...(this.observableProperties ?? [])];
    }

    @SerializableMember({
        rdf: {
            predicate: [rdfs.comment, dcterms.description],
            language: 'en',
        },
    })
    description: string;
}

import { SerializableObject } from '@openhps/core';
import { sosa } from '@openhps/rdf';
import { Property } from './Property';

@SerializableObject({
    rdf: {
        type: sosa.ActuatableProperty,
    },
})
export class ActuableProperty extends Property {}

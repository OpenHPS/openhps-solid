import { SerializableObject } from '@openhps/core';
import { ssn } from '@openhps/rdf/vocab';

@SerializableObject({
    rdf: {
        type: ssn.Stimulus,
    },
})
export class Event {}

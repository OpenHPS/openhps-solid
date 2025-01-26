import { SerializableObject } from '@openhps/core';
import { ssn } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: ssn.Stimulus,
    },
})
export class Event {}

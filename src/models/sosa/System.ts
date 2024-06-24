import { Model, SerializableArrayMember, SerializableMember, SerializableObject } from '@openhps/core';
import { rdfs, ssn } from '../../vocab';
import { Procedure } from './Procedure';
import { Deployment } from './Deployment';
import { ModelGraph } from '@openhps/core/internal';
import { applyMixins } from '../utils';
import { SerializableThing } from '../SerializableThing';

@SerializableObject({
    rdf: {
        type: ssn.System,
    },
})
export class System extends SerializableThing { // eslint-disable-line
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

    @SerializableMember({
        rdf: {
            predicate: ssn.hasDeployment,
            language: 'en',
        },
    })
    deployment?: Deployment;

    @SerializableArrayMember(System, {
        rdf: {
            predicate: ssn.hasSubSystem,
        },
    })
    subSystems?: System[] = [];

    @SerializableArrayMember(Procedure, {
        rdf: {
            predicate: ssn._implements,
        },
    })
    procedures?: Procedure[] = [];
}
export interface System extends SerializableThing, Model<any, any> {} // eslint-disable-line
applyMixins(System, [ModelGraph]);

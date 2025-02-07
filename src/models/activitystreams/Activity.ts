import { SerializableMember, SerializableObject } from '@openhps/core';
import { activitystreams } from '../../terms';
import { IriString } from '@inrupt/solid-client';

@SerializableObject({
    rdf: {
        type: activitystreams.Activity,
    },
})
export class Activity {
    @SerializableMember({
        rdf: {
            predicate: activitystreams.object,
            serializer: false,
        },
    })
    object: IriString;
    @SerializableMember({
        rdf: {
            predicate: activitystreams.actor,
            serializer: false,
        },
    })
    actor: IriString;

    @SerializableMember({
        rdf: {
            predicate: activitystreams.target,
            serializer: false,
        },
    })
    target: IriString;

    @SerializableMember({
        rdf: {
            predicate: activitystreams.published,
        },
    })
    published: Date;
}

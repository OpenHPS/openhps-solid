import { SerializableMember, SerializableObject } from '@openhps/core';
import { dcterms, SerializableNamedNode, SerializableThing } from '@openhps/rdf';
import { ldes, tree } from '../../terms';
import { IriString } from '@inrupt/solid-client';
import { Node } from '../tree';

@SerializableObject({
    rdf: {
        type: ldes.EventStream,
    },
})
export class EventStream extends SerializableThing {
    @SerializableMember({
        rdf: {
            predicate: ldes.timestampPath,
        },
    })
    protected timestampPath: SerializableNamedNode = new SerializableNamedNode(dcterms.created);
    @SerializableMember({
        rdf: {
            predicate: ldes.versionOfPath,
        },
    })
    protected versionOfPath: SerializableNamedNode = new SerializableNamedNode(dcterms.isVersionOf);

    @SerializableMember({
        rdf: {
            predicate: tree.view,
        },
    })
    view: Node;

    /**
     * Set the timestamp path
     * @param {IriString} path Timestamp path (predicate)
     */
    setTimestampPath(path: IriString) {
        this.timestampPath = new SerializableNamedNode(path);
    }

    /**
     * Set the version path
     * @param {IriString} path Version path (predicate)
     */
    setVersionOfPath(path: IriString) {
        this.versionOfPath = new SerializableNamedNode(path);
    }
}

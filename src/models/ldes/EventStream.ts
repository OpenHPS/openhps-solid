import { SerializableMember, SerializableObject } from "@openhps/core";
import { dcterms, SerializableNamedNode, SerializableThing } from "@openhps/rdf";
import { ldes, tree } from "../../terms";

@SerializableObject({
    rdf: {
        type: ldes.EventStream,
    }
})
export class EventStream extends SerializableThing {
    @SerializableMember({
        rdf: {
            predicate: ldes.timestampPath
        }
    })
    protected timestampPath: SerializableNamedNode = new SerializableNamedNode(dcterms.created);
    @SerializableMember({
        rdf: {
            predicate: ldes.versionOfPath
        }
    })
    protected versionOfPath: SerializableNamedNode = new SerializableNamedNode(dcterms.isVersionOf);

    @SerializableMember({
        rdf: {
            predicate: tree.view
        }
    })
    view: SerializableNamedNode;
}

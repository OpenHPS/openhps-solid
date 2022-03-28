import { SerializableMember, SerializableObject } from "@openhps/core";
import { sosa, rdfs } from "@openhps/rdf";

@SerializableObject({
    rdf: {
        type: sosa.Platform
    }
})
export class Platform {
    @SerializableMember({
        rdf: {
            predicate: rdfs.label,
            language: "en"
        }
    })
    label?: string;

    @SerializableMember({
        rdf: {
            predicate: rdfs.comment,
            language: "en"
        }
    })
    comment?: string;
}

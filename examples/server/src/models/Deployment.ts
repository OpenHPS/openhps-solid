import { SerializableMember, SerializableObject } from "@openhps/core";
import { rdfs, ssn } from "@openhps/rdf";
import { Platform } from "./Platform";

@SerializableObject({
    rdf: {
        type: ssn.Deployment
    }
})
export class Deployment {
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

    @SerializableMember({
        rdf: {
            predicate: ssn.deployedOnPlatform,
            language: "en"
        }
    })
    platform?: Platform;
}

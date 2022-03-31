import { SerializableMember, SerializableObject } from "@openhps/core";
import { rdfs, ssn } from "@openhps/rdf";
import { Deployment } from "./Deployment";

@SerializableObject({
    rdf: {
        type: ssn.System
    }
})
export class System {
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
            predicate: ssn.hasDeployment,
            language: "en"
        }
    })
    deployment?: Deployment;
}

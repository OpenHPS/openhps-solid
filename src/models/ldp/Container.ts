import { SerializableObject } from "@openhps/core";
import { ldp } from "../../terms";
import { SerializableThing } from "@openhps/rdf";

@SerializableObject({
    rdf: {
        type: ldp.Container,
    }
})
export class Container extends SerializableThing {

}

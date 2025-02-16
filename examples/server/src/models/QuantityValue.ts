import { SerializableMember, SerializableObject, Unit } from "@openhps/core";
import { qudt } from "@openhps/rdf";

@SerializableObject({
    rdf: {
        type: qudt.QuantityValue
    }
})
export class QuantityValue {
    @SerializableMember({
        rdf: {
            predicate: qudt.unit
        }
    })
    unit: Unit;

    @SerializableMember({
        rdf: {
            predicate: qudt.numericValue
        }
    })
    numericValue: number;
}

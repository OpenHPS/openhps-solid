import { DataObject, SerializableMember, SerializableObject } from "@openhps/core";

@SerializableObject()
export class SolidDataObject extends DataObject {
    @SerializableMember()
    oidcIssuer: string;
}

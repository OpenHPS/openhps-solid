import { DataObject, SerializableMember, SerializableObject } from '@openhps/core';
import '@openhps/rdf';

@SerializableObject()
export class SolidProfileObject extends DataObject {
    /**
     * OpenID Issuer
     */
    @SerializableMember()
    oidcIssuer: string;

    /**
     * Session Identifier
     */
    @SerializableMember()
    sessionId: string;

    constructor(webId?: string) {
        super(webId);
        this.toThing();
    }

    /**
     * Unique WebID
     */
    get webId(): string {
        return this.uid;
    }

    set webId(value: string) {
        this.uid = value;
    }

    /**
     * Get the profile document URL without trailing hashtag
     *
     * @returns {URL} Profile URL
     */
    get profileDocumentUrl(): URL {
        const profileDocumentUrl = new URL(this.webId);
        profileDocumentUrl.hash = "";
        return profileDocumentUrl;
    }
}

/* Add the WebID attribute to the DataObject prototype, and allow serialization */
DataObject.prototype.webId = undefined;
SerializableMember(String)(DataObject.prototype, "webId");

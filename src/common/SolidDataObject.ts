import { DataObject, SerializableMember, SerializableObject } from '@openhps/core';

@SerializableObject()
export class SolidDataObject extends DataObject {
    @SerializableMember()
    oidcIssuer: string;

    @SerializableMember()
    sessionId: string;

    @SerializableMember()
    refreshToken: string;

    constructor(webId?: string) {
        super(webId);
    }
    
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
SerializableMember(String)(DataObject, "webID");

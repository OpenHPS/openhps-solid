import { foaf } from '@openhps/rdf/vocab';
import { DataFrame, DataObject, SerializableMember, SerializableObject } from '@openhps/core';

@SerializableObject({
    rdf: {
        type: foaf.Person,
    },
})
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
     * @returns {URL} Profile URL
     */
    get profileDocumentUrl(): URL {
        const profileDocumentUrl = new URL(this.webId);
        profileDocumentUrl.hash = '';
        return profileDocumentUrl;
    }
}

/* Add the WebID attribute to the DataObject prototype, and allow serialization */
DataObject.prototype.webId = undefined;
SerializableMember(String)(DataObject.prototype, 'webId');

/* Add the WebID attribute to the DataFrame prototype, and allow serialization */
DataFrame.prototype.webId = undefined;
SerializableMember(String)(DataFrame.prototype, 'webId');

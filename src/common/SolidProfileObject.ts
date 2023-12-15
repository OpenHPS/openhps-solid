import { foaf, vcard } from '@openhps/rdf';
import { DataFrame, DataObject, SerializableMember, SerializableObject } from '@openhps/core';

@SerializableObject({
    rdf: {
        type: foaf.Person,
    },
})
export class SolidProfileObject extends DataObject {
    @SerializableMember({
        rdf: {
            predicates: [vcard.given_name, foaf.givenname],
        },
    })
    firstName: string;

    @SerializableMember({
        rdf: {
            predicates: [vcard.family_name, foaf.surname],
        },
    })
    lastName: string;

    @SerializableMember({
        rdf: {
            predicates: [vcard.fn, foaf.name],
        },
    })
    private _formattedName: string;

    @SerializableMember({
        rdf: {
            predicates: [foaf.nick],
        },
    })
    nickname?: string;

    @SerializableMember({
        rdf: {
            predicate: [vcard.hasPhoto],
        },
    })
    picture?: string;

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

    get name(): string {
        return this._formattedName ?? `${this.firstName} ${this.lastName}`;
    }

    set name(name: string) {
        this._formattedName = name;
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

type IriString = `${'http' | 'https'}://${string}`;
type Property = IriString; // eslint-disable-line
type Class = IriString; // eslint-disable-line
type Datatype = IriString; // eslint-disable-line
type OwlClass = IriString; // eslint-disable-line
type OwlObjectProperty = IriString; // eslint-disable-line
type OwlDatatypeProperty = IriString; // eslint-disable-line
type HydraResource = IriString; // eslint-disable-line
type HydraClass = IriString; // eslint-disable-line
type HydraLink = IriString; // eslint-disable-line
type HydraTemplatedLink = IriString; // eslint-disable-line
type HydraVariableRepresentation = IriString; // eslint-disable-line
type OtherIndividual = IriString; // eslint-disable-line

/**
 * relationship
 * 
 * On a Relationship object, describes the type of relationship
 *
 * https://www.w3.org/ns/activitystreams#relationship
 */
export const relationship: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#relationship';

/**
 * Activity
 * 
 * An Object representing some form of Action that has been taken
 *
 * https://www.w3.org/ns/activitystreams#Activity
 */
export const Activity: OwlClass = 'https://www.w3.org/ns/activitystreams#Activity';

/**
 * Object
 * 
 * undefined
 * Note that `Object` is a reserved Javascript keyword, and is therefore suffixed by `__workaround`.
 * For a list of reserved keywords, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords.
 *
 * https://www.w3.org/ns/activitystreams#Object
 */
export const Object__workaround: OwlClass = 'https://www.w3.org/ns/activitystreams#Object';

/**
 * Link
 * 
 * Represents a qualified reference to another resource. Patterned after the RFC5988 Web Linking Model
 *
 * https://www.w3.org/ns/activitystreams#Link
 */
export const Link: OwlClass = 'https://www.w3.org/ns/activitystreams#Link';

/**
 * Collection
 * 
 * An ordered or unordered collection of Objects or Links
 *
 * https://www.w3.org/ns/activitystreams#Collection
 */
export const Collection: OwlClass = 'https://www.w3.org/ns/activitystreams#Collection';

/**
 * CollectionPage
 * 
 * A subset of items from a Collection
 *
 * https://www.w3.org/ns/activitystreams#CollectionPage
 */
export const CollectionPage: OwlClass = 'https://www.w3.org/ns/activitystreams#CollectionPage';

/**
 * Image
 * 
 * An Image file
 *
 * https://www.w3.org/ns/activitystreams#Image
 */
export const Image: OwlClass = 'https://www.w3.org/ns/activitystreams#Image';

/**
 * OrderedItems
 * 
 * A rdf:List variant for Objects and Links
 *
 * https://www.w3.org/ns/activitystreams#OrderedItems
 */
export const OrderedItems: OwlClass = 'https://www.w3.org/ns/activitystreams#OrderedItems';

/**
 * Relationship
 * 
 * Represents a Social Graph relationship between two Individuals (indicated by the 'a' and 'b' properties)
 *
 * https://www.w3.org/ns/activitystreams#Relationship
 */
export const Relationship: OwlClass = 'https://www.w3.org/ns/activitystreams#Relationship';

/**
 * Question
 * 
 * A question of any sort.
 *
 * https://www.w3.org/ns/activitystreams#Question
 */
export const Question: OwlClass = 'https://www.w3.org/ns/activitystreams#Question';

/**
 * Profile
 * 
 * A Profile Document
 *
 * https://www.w3.org/ns/activitystreams#Profile
 */
export const Profile: OwlClass = 'https://www.w3.org/ns/activitystreams#Profile';

/**
 * Tombstone
 * 
 * A placeholder for a deleted object
 *
 * https://www.w3.org/ns/activitystreams#Tombstone
 */
export const Tombstone: OwlClass = 'https://www.w3.org/ns/activitystreams#Tombstone';

/**
 * Place
 * 
 * A physical or logical location
 *
 * https://www.w3.org/ns/activitystreams#Place
 */
export const Place: OwlClass = 'https://www.w3.org/ns/activitystreams#Place';

/**
 * OrderedCollectionPage
 * 
 * An ordered subset of items from an OrderedCollection
 *
 * https://www.w3.org/ns/activitystreams#OrderedCollectionPage
 */
export const OrderedCollectionPage: OwlClass = 'https://www.w3.org/ns/activitystreams#OrderedCollectionPage';

/**
 * Accept
 * 
 * Actor accepts the Object
 *
 * https://www.w3.org/ns/activitystreams#Accept
 */
export const Accept: OwlClass = 'https://www.w3.org/ns/activitystreams#Accept';

/**
 * Block
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#Block
 */
export const Block: OwlClass = 'https://www.w3.org/ns/activitystreams#Block';

/**
 * Ignore
 * 
 * Actor is ignoring the Object
 *
 * https://www.w3.org/ns/activitystreams#Ignore
 */
export const Ignore: OwlClass = 'https://www.w3.org/ns/activitystreams#Ignore';

/**
 * IntransitiveActivity
 * 
 * An Activity that has no direct object
 *
 * https://www.w3.org/ns/activitystreams#IntransitiveActivity
 */
export const IntransitiveActivity: OwlClass = 'https://www.w3.org/ns/activitystreams#IntransitiveActivity';

/**
 * Add
 * 
 * To Add an Object or Link to Something
 *
 * https://www.w3.org/ns/activitystreams#Add
 */
export const Add: OwlClass = 'https://www.w3.org/ns/activitystreams#Add';

/**
 * Announce
 * 
 * Actor announces the object to the target
 *
 * https://www.w3.org/ns/activitystreams#Announce
 */
export const Announce: OwlClass = 'https://www.w3.org/ns/activitystreams#Announce';

/**
 * Application
 * 
 * Represents a software application of any sort
 *
 * https://www.w3.org/ns/activitystreams#Application
 */
export const Application: OwlClass = 'https://www.w3.org/ns/activitystreams#Application';

/**
 * Arrive
 * 
 * To Arrive Somewhere (can be used, for instance, to indicate that a particular entity is currently located somewhere, e.g. a "check-in")
 *
 * https://www.w3.org/ns/activitystreams#Arrive
 */
export const Arrive: OwlClass = 'https://www.w3.org/ns/activitystreams#Arrive';

/**
 * Article
 * 
 * A written work. Typically several paragraphs long. For example, a blog post or a news article.
 *
 * https://www.w3.org/ns/activitystreams#Article
 */
export const Article: OwlClass = 'https://www.w3.org/ns/activitystreams#Article';

/**
 * Audio
 * 
 * An audio file
 *
 * https://www.w3.org/ns/activitystreams#Audio
 */
export const Audio: OwlClass = 'https://www.w3.org/ns/activitystreams#Audio';

/**
 * Document
 * 
 * Represents a digital document/file of any sort
 *
 * https://www.w3.org/ns/activitystreams#Document
 */
export const Document: OwlClass = 'https://www.w3.org/ns/activitystreams#Document';

/**
 * OrderedCollection
 * 
 * A variation of Collection in which items are strictly ordered
 *
 * https://www.w3.org/ns/activitystreams#OrderedCollection
 */
export const OrderedCollection: OwlClass = 'https://www.w3.org/ns/activitystreams#OrderedCollection';

/**
 * Create
 * 
 * To Create Something
 *
 * https://www.w3.org/ns/activitystreams#Create
 */
export const Create: OwlClass = 'https://www.w3.org/ns/activitystreams#Create';

/**
 * Delete
 * 
 * To Delete Something
 *
 * https://www.w3.org/ns/activitystreams#Delete
 */
export const Delete: OwlClass = 'https://www.w3.org/ns/activitystreams#Delete';

/**
 * Dislike
 * 
 * The actor dislikes the object
 *
 * https://www.w3.org/ns/activitystreams#Dislike
 */
export const Dislike: OwlClass = 'https://www.w3.org/ns/activitystreams#Dislike';

/**
 * Event
 * 
 * An Event of any kind
 *
 * https://www.w3.org/ns/activitystreams#Event
 */
export const Event: OwlClass = 'https://www.w3.org/ns/activitystreams#Event';

/**
 * Flag
 * 
 * To flag something (e.g. flag as inappropriate, flag as spam, etc)
 *
 * https://www.w3.org/ns/activitystreams#Flag
 */
export const Flag: OwlClass = 'https://www.w3.org/ns/activitystreams#Flag';

/**
 * Follow
 * 
 * To Express Interest in Something
 *
 * https://www.w3.org/ns/activitystreams#Follow
 */
export const Follow: OwlClass = 'https://www.w3.org/ns/activitystreams#Follow';

/**
 * Group
 * 
 * A Group of any kind.
 *
 * https://www.w3.org/ns/activitystreams#Group
 */
export const Group: OwlClass = 'https://www.w3.org/ns/activitystreams#Group';

/**
 * Invite
 * 
 * To invite someone or something to something
 *
 * https://www.w3.org/ns/activitystreams#Invite
 */
export const Invite: OwlClass = 'https://www.w3.org/ns/activitystreams#Invite';

/**
 * Offer
 * 
 * To Offer something to someone or something
 *
 * https://www.w3.org/ns/activitystreams#Offer
 */
export const Offer: OwlClass = 'https://www.w3.org/ns/activitystreams#Offer';

/**
 * Join
 * 
 * To Join Something
 *
 * https://www.w3.org/ns/activitystreams#Join
 */
export const Join: OwlClass = 'https://www.w3.org/ns/activitystreams#Join';

/**
 * Leave
 * 
 * To Leave Something
 *
 * https://www.w3.org/ns/activitystreams#Leave
 */
export const Leave: OwlClass = 'https://www.w3.org/ns/activitystreams#Leave';

/**
 * Like
 * 
 * To Like Something
 *
 * https://www.w3.org/ns/activitystreams#Like
 */
export const Like: OwlClass = 'https://www.w3.org/ns/activitystreams#Like';

/**
 * View
 * 
 * The actor viewed the object
 *
 * https://www.w3.org/ns/activitystreams#View
 */
export const View: OwlClass = 'https://www.w3.org/ns/activitystreams#View';

/**
 * Listen
 * 
 * The actor listened to the object
 *
 * https://www.w3.org/ns/activitystreams#Listen
 */
export const Listen: OwlClass = 'https://www.w3.org/ns/activitystreams#Listen';

/**
 * Read
 * 
 * The actor read the object
 *
 * https://www.w3.org/ns/activitystreams#Read
 */
export const Read: OwlClass = 'https://www.w3.org/ns/activitystreams#Read';

/**
 * Move
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#Move
 */
export const Move: OwlClass = 'https://www.w3.org/ns/activitystreams#Move';

/**
 * Travel
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#Travel
 */
export const Travel: OwlClass = 'https://www.w3.org/ns/activitystreams#Travel';

/**
 * Mention
 * 
 * A specialized Link that represents an @mention
 *
 * https://www.w3.org/ns/activitystreams#Mention
 */
export const Mention: OwlClass = 'https://www.w3.org/ns/activitystreams#Mention';

/**
 * Note
 * 
 * A Short note, typically less than a single paragraph. A "tweet" is an example, or a "status update"
 *
 * https://www.w3.org/ns/activitystreams#Note
 */
export const Note: OwlClass = 'https://www.w3.org/ns/activitystreams#Note';

/**
 * Page
 * 
 * A Web Page
 *
 * https://www.w3.org/ns/activitystreams#Page
 */
export const Page: OwlClass = 'https://www.w3.org/ns/activitystreams#Page';

/**
 * Person
 * 
 * A Person
 *
 * https://www.w3.org/ns/activitystreams#Person
 */
export const Person: OwlClass = 'https://www.w3.org/ns/activitystreams#Person';

/**
 * Organization
 * 
 * An Organization
 *
 * https://www.w3.org/ns/activitystreams#Organization
 */
export const Organization: OwlClass = 'https://www.w3.org/ns/activitystreams#Organization';

/**
 * Reject
 * 
 * Actor rejects the Object
 *
 * https://www.w3.org/ns/activitystreams#Reject
 */
export const Reject: OwlClass = 'https://www.w3.org/ns/activitystreams#Reject';

/**
 * Remove
 * 
 * To Remove Something
 *
 * https://www.w3.org/ns/activitystreams#Remove
 */
export const Remove: OwlClass = 'https://www.w3.org/ns/activitystreams#Remove';

/**
 * Service
 * 
 * A service provided by some entity
 *
 * https://www.w3.org/ns/activitystreams#Service
 */
export const Service: OwlClass = 'https://www.w3.org/ns/activitystreams#Service';

/**
 * TentativeAccept
 * 
 * Actor tentatively accepts the Object
 *
 * https://www.w3.org/ns/activitystreams#TentativeAccept
 */
export const TentativeAccept: OwlClass = 'https://www.w3.org/ns/activitystreams#TentativeAccept';

/**
 * TentativeReject
 * 
 * Actor tentatively rejects the object
 *
 * https://www.w3.org/ns/activitystreams#TentativeReject
 */
export const TentativeReject: OwlClass = 'https://www.w3.org/ns/activitystreams#TentativeReject';

/**
 * Undo
 * 
 * To Undo Something. This would typically be used to indicate that a previous Activity has been undone.
 *
 * https://www.w3.org/ns/activitystreams#Undo
 */
export const Undo: OwlClass = 'https://www.w3.org/ns/activitystreams#Undo';

/**
 * Update
 * 
 * To Update/Modify Something
 *
 * https://www.w3.org/ns/activitystreams#Update
 */
export const Update: OwlClass = 'https://www.w3.org/ns/activitystreams#Update';

/**
 * Video
 * 
 * A Video document of any kind.
 *
 * https://www.w3.org/ns/activitystreams#Video
 */
export const Video: OwlClass = 'https://www.w3.org/ns/activitystreams#Video';

/**
 * actor
 * 
 * Subproperty of as:attributedTo that identifies the primary actor
 *
 * https://www.w3.org/ns/activitystreams#actor
 */
export const actor: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#actor';

/**
 * attributedTo
 * 
 * Identifies an entity to which an object is attributed
 *
 * https://www.w3.org/ns/activitystreams#attributedTo
 */
export const attributedTo: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#attributedTo';

/**
 * attachment
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#attachment
 */
export const attachment: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#attachment';

/**
 * attachments
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#attachments
 */
export const attachments: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#attachments';

/**
 * author
 * 
 * Identifies the author of an object. Deprecated. Use as:attributedTo instead
 *
 * https://www.w3.org/ns/activitystreams#author
 */
export const author: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#author';

/**
 * bcc
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#bcc
 */
export const bcc: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#bcc';

/**
 * bto
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#bto
 */
export const bto: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#bto';

/**
 * cc
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#cc
 */
export const cc: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#cc';

/**
 * context
 * 
 * Specifies the context within which an object exists or an activity was performed
 *
 * https://www.w3.org/ns/activitystreams#context
 */
export const context: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#context';

/**
 * current
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#current
 */
export const current: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#current';

/**
 * first
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#first
 */
export const first: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#first';

/**
 * generator
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#generator
 */
export const generator: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#generator';

/**
 * icon
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#icon
 */
export const icon: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#icon';

/**
 * image
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#image
 */
export const image: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#image';

/**
 * inReplyTo
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#inReplyTo
 */
export const inReplyTo: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#inReplyTo';

/**
 * items
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#items
 */
export const items: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#items';

/**
 * last
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#last
 */
export const last: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#last';

/**
 * location
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#location
 */
export const location: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#location';

/**
 * next
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#next
 */
export const next: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#next';

/**
 * object
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#object
 */
export const object: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#object';

/**
 * oneOf
 * 
 * Describes a possible exclusive answer or option for a question.
 *
 * https://www.w3.org/ns/activitystreams#oneOf
 */
export const oneOf: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#oneOf';

/**
 * oneOf
 * 
 * Describes a possible inclusive answer or option for a question.
 *
 * https://www.w3.org/ns/activitystreams#anyOf
 */
export const anyOf: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#anyOf';

/**
 * prev
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#prev
 */
export const prev: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#prev';

/**
 * preview
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#preview
 */
export const preview: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#preview';

/**
 * provider
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#provider
 */
export const provider: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#provider';

/**
 * replies
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#replies
 */
export const replies: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#replies';

/**
 * result
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#result
 */
export const result: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#result';

/**
 * audience
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#audience
 */
export const audience: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#audience';

/**
 * partOf
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#partOf
 */
export const partOf: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#partOf';

/**
 * tag
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#tag
 */
export const tag: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#tag';

/**
 * tags
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#tags
 */
export const tags: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#tags';

/**
 * target
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#target
 */
export const target: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#target';

/**
 * origin
 * 
 * For certain activities, specifies the entity from which the action is directed.
 *
 * https://www.w3.org/ns/activitystreams#origin
 */
export const origin: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#origin';

/**
 * instrument
 * 
 * Indentifies an object used (or to be used) to complete an activity
 *
 * https://www.w3.org/ns/activitystreams#instrument
 */
export const instrument: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#instrument';

/**
 * to
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#to
 */
export const to: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#to';

/**
 * url
 * 
 * Specifies a link to a specific representation of the Object
 *
 * https://www.w3.org/ns/activitystreams#url
 */
export const url: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#url';

/**
 * a
 * 
 * On a Relationship object, identifies the subject. e.g. when saying "John is connected to Sally", 'subject' refers to 'John'
 *
 * https://www.w3.org/ns/activitystreams#subject
 */
export const subject: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#subject';

/**
 * describes
 * 
 * On a Profile object, describes the object described by the profile
 *
 * https://www.w3.org/ns/activitystreams#describes
 */
export const describes: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#describes';

/**
 * formerType
 * 
 * On a Tombstone object, describes the former type of the deleted object
 *
 * https://www.w3.org/ns/activitystreams#formerType
 */
export const formerType: OwlObjectProperty = 'https://www.w3.org/ns/activitystreams#formerType';

/**
 * accuracy
 * 
 * Specifies the accuracy around the point established by the longitude and latitude
 *
 * https://www.w3.org/ns/activitystreams#accuracy
 */
export const accuracy: OtherIndividual = 'https://www.w3.org/ns/activitystreams#accuracy';

/**
 * altitude
 * 
 * The altitude of a place
 *
 * https://www.w3.org/ns/activitystreams#altitude
 */
export const altitude: OtherIndividual = 'https://www.w3.org/ns/activitystreams#altitude';

/**
 * content
 * 
 * The content of the object.
 *
 * https://www.w3.org/ns/activitystreams#content
 */
export const content: OwlDatatypeProperty = 'https://www.w3.org/ns/activitystreams#content';

/**
 * name
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#name
 */
export const name: OwlDatatypeProperty = 'https://www.w3.org/ns/activitystreams#name';

/**
 * downstreamDuplicates
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#downstreamDuplicates
 */
export const downstreamDuplicates: OtherIndividual = 'https://www.w3.org/ns/activitystreams#downstreamDuplicates';

/**
 * duration
 * 
 * The duration of the object
 *
 * https://www.w3.org/ns/activitystreams#duration
 */
export const duration: OtherIndividual = 'https://www.w3.org/ns/activitystreams#duration';

/**
 * endTime
 * 
 * The ending time of the object
 *
 * https://www.w3.org/ns/activitystreams#endTime
 */
export const endTime: OtherIndividual = 'https://www.w3.org/ns/activitystreams#endTime';

/**
 * height
 * 
 * The display height expressed as device independent pixels
 *
 * https://www.w3.org/ns/activitystreams#height
 */
export const height: OtherIndividual = 'https://www.w3.org/ns/activitystreams#height';

/**
 * href
 * 
 * The target URI of the Link
 *
 * https://www.w3.org/ns/activitystreams#href
 */
export const href: OtherIndividual = 'https://www.w3.org/ns/activitystreams#href';

/**
 * hreflang
 * 
 * A hint about the language of the referenced resource
 *
 * https://www.w3.org/ns/activitystreams#hreflang
 */
export const hreflang: OtherIndividual = 'https://www.w3.org/ns/activitystreams#hreflang';

/**
 * id
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#id
 */
export const id: OtherIndividual = 'https://www.w3.org/ns/activitystreams#id';

/**
 * latitude
 * 
 * The latitude
 *
 * https://www.w3.org/ns/activitystreams#latitude
 */
export const latitude: OtherIndividual = 'https://www.w3.org/ns/activitystreams#latitude';

/**
 * longitude
 * 
 * The longitude
 *
 * https://www.w3.org/ns/activitystreams#longitude
 */
export const longitude: OtherIndividual = 'https://www.w3.org/ns/activitystreams#longitude';

/**
 * mediaType
 * 
 * The MIME Media Type
 *
 * https://www.w3.org/ns/activitystreams#mediaType
 */
export const mediaType: OtherIndividual = 'https://www.w3.org/ns/activitystreams#mediaType';

/**
 * objectType
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#objectType
 */
export const objectType: OtherIndividual = 'https://www.w3.org/ns/activitystreams#objectType';

/**
 * published
 * 
 * Specifies the date and time the object was published
 *
 * https://www.w3.org/ns/activitystreams#published
 */
export const published: OtherIndividual = 'https://www.w3.org/ns/activitystreams#published';

/**
 * radius
 * 
 * Specifies a radius around the point established by the longitude and latitude
 *
 * https://www.w3.org/ns/activitystreams#radius
 */
export const radius: OtherIndividual = 'https://www.w3.org/ns/activitystreams#radius';

/**
 * rating
 * 
 * A numeric rating (>= 0.0, <= 5.0) for the object
 *
 * https://www.w3.org/ns/activitystreams#rating
 */
export const rating: OtherIndividual = 'https://www.w3.org/ns/activitystreams#rating';

/**
 * rel
 * 
 * The RFC 5988 or HTML5 Link Relation associated with the Link
 *
 * https://www.w3.org/ns/activitystreams#rel
 */
export const rel: OwlDatatypeProperty = 'https://www.w3.org/ns/activitystreams#rel';

/**
 * startIndex
 * 
 * In a strictly ordered logical collection, specifies the index position of the first item in the items list
 *
 * https://www.w3.org/ns/activitystreams#startIndex
 */
export const startIndex: OtherIndividual = 'https://www.w3.org/ns/activitystreams#startIndex';

/**
 * startTime
 * 
 * The starting time of the object
 *
 * https://www.w3.org/ns/activitystreams#startTime
 */
export const startTime: OtherIndividual = 'https://www.w3.org/ns/activitystreams#startTime';

/**
 * summary
 * 
 * A short summary of the object
 *
 * https://www.w3.org/ns/activitystreams#summary
 */
export const summary: OwlDatatypeProperty = 'https://www.w3.org/ns/activitystreams#summary';

/**
 * totalItems
 * 
 * The total number of items in a logical collection
 *
 * https://www.w3.org/ns/activitystreams#totalItems
 */
export const totalItems: OtherIndividual = 'https://www.w3.org/ns/activitystreams#totalItems';

/**
 * units
 * 
 * Identifies the unit of measurement used by the radius, altitude and accuracy properties. The value can be expressed either as one of a set of predefined units or as a well-known common URI that identifies units.
 *
 * https://www.w3.org/ns/activitystreams#units
 */
export const units: OtherIndividual = 'https://www.w3.org/ns/activitystreams#units';

/**
 * updated
 * 
 * Specifies when the object was last updated
 *
 * https://www.w3.org/ns/activitystreams#updated
 */
export const updated: OtherIndividual = 'https://www.w3.org/ns/activitystreams#updated';

/**
 * upstreamDuplicates
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#upstreamDuplicates
 */
export const upstreamDuplicates: OtherIndividual = 'https://www.w3.org/ns/activitystreams#upstreamDuplicates';

/**
 * verb
 * 
 * 
 *
 * https://www.w3.org/ns/activitystreams#verb
 */
export const verb: OtherIndividual = 'https://www.w3.org/ns/activitystreams#verb';

/**
 * width
 * 
 * Specifies the preferred display width of the content, expressed in terms of device independent pixels.
 *
 * https://www.w3.org/ns/activitystreams#width
 */
export const width: OtherIndividual = 'https://www.w3.org/ns/activitystreams#width';

/**
 * deleted
 * 
 * Specifies the date and time the object was deleted
 *
 * https://www.w3.org/ns/activitystreams#deleted
 */
export const deleted: OtherIndividual = 'https://www.w3.org/ns/activitystreams#deleted';

export const _BASE: IriString = 'https://www.w3.org/ns/activitystreams#';
export const _PREFIX: string = 'activitystreams';
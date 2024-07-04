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
 * has retention policy
 * 
 * Links to a retention policy.
 *
 * https://w3id.org/ldes#retentionPolicy
 */
export const retentionPolicy: Property = 'https://w3id.org/ldes#retentionPolicy';

/**
 * amount
 * 
 * Amount of versions to keep.
 *
 * https://w3id.org/ldes#amount
 */
export const amount: Property = 'https://w3id.org/ldes#amount';

/**
 * point in time
 * 
 * After this point in time members are kept.
 *
 * https://w3id.org/ldes#pointInTime
 */
export const pointInTime: Property = 'https://w3id.org/ldes#pointInTime';

/**
 * version key
 * 
 * A list of SHACL property paths to compose a version key.
 *
 * https://w3id.org/ldes#versionKey
 */
export const versionKey: Property = 'https://w3id.org/ldes#versionKey';

/**
 * versionOf Path
 * 
 * SHACL property path to the non-versioned identifier of the entity.
 *
 * https://w3id.org/ldes#versionOfPath
 */
export const versionOfPath: Property = 'https://w3id.org/ldes#versionOfPath';

/**
 * Timestamp Path
 * 
 * SHACL property path to the timestamp when the version object entered the event stream.
 *
 * https://w3id.org/ldes#timestampPath
 */
export const timestampPath: Property = 'https://w3id.org/ldes#timestampPath';

/**
 * Version Materialization Of
 * 
 * Links to the original LDES
 *
 * https://w3id.org/ldes#versionMaterializationOf
 */
export const versionMaterializationOf: Property = 'https://w3id.org/ldes#versionMaterializationOf';

/**
 * Version Materialization Until
 * 
 * Timestamp until versions were processed
 *
 * https://w3id.org/ldes#versionMaterializationUntil
 */
export const versionMaterializationUntil: Property = 'https://w3id.org/ldes#versionMaterializationUntil';

/**
 * Event Stream
 * 
 * An Event Stream is a tree:Collection containing immutable members.
 *
 * https://w3id.org/ldes#EventStream
 */
export const EventStream: Class = 'https://w3id.org/ldes#EventStream';

/**
 * The Linked Data Event Streams specification
 * 
 * A hypermedia specification for maintaining a collection with immutable members.
 *
 * https://w3id.org/ldes#Vocabulary
 */
export const Vocabulary: OtherIndividual = 'https://w3id.org/ldes#Vocabulary';

/**
 * Retention Policy
 * 
 * The abstract concept of a retention policy.
 *
 * https://w3id.org/ldes#RetentionPolicy
 */
export const RetentionPolicy: OtherIndividual = 'https://w3id.org/ldes#RetentionPolicy';

export const _BASE: IriString = 'https://w3id.org/ldes#';
export const _PREFIX: string = 'ldes';
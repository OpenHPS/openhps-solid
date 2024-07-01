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
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#hasMemberRelation
 */
export const hasMemberRelation: Property = 'http://www.w3.org/ns/ldp#hasMemberRelation';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#isMemberOfRelation
 */
export const isMemberOfRelation: Property = 'http://www.w3.org/ns/ldp#isMemberOfRelation';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#membershipResource
 */
export const membershipResource: Property = 'http://www.w3.org/ns/ldp#membershipResource';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#insertedContentRelation
 */
export const insertedContentRelation: Property = 'http://www.w3.org/ns/ldp#insertedContentRelation';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#member
 */
export const member: Property = 'http://www.w3.org/ns/ldp#member';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#contains
 */
export const contains: Property = 'http://www.w3.org/ns/ldp#contains';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#constrainedBy
 */
export const constrainedBy: Property = 'http://www.w3.org/ns/ldp#constrainedBy';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#pageSortCriteria
 */
export const pageSortCriteria: Property = 'http://www.w3.org/ns/ldp#pageSortCriteria';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#pageSortPredicate
 */
export const pageSortPredicate: Property = 'http://www.w3.org/ns/ldp#pageSortPredicate';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#pageSortOrder
 */
export const pageSortOrder: Property = 'http://www.w3.org/ns/ldp#pageSortOrder';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#pageSortCollation
 */
export const pageSortCollation: Property = 'http://www.w3.org/ns/ldp#pageSortCollation';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#pageSequence
 */
export const pageSequence: Property = 'http://www.w3.org/ns/ldp#pageSequence';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#inbox
 */
export const inbox: Property = 'http://www.w3.org/ns/ldp#inbox';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#Resource
 */
export const Resource: Class = 'http://www.w3.org/ns/ldp#Resource';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#RDFSource
 */
export const RDFSource: Class = 'http://www.w3.org/ns/ldp#RDFSource';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#NonRDFSource
 */
export const NonRDFSource: Class = 'http://www.w3.org/ns/ldp#NonRDFSource';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#Container
 */
export const Container: Class = 'http://www.w3.org/ns/ldp#Container';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#BasicContainer
 */
export const BasicContainer: Class = 'http://www.w3.org/ns/ldp#BasicContainer';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#DirectContainer
 */
export const DirectContainer: Class = 'http://www.w3.org/ns/ldp#DirectContainer';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#IndirectContainer
 */
export const IndirectContainer: Class = 'http://www.w3.org/ns/ldp#IndirectContainer';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#Page
 */
export const Page: Class = 'http://www.w3.org/ns/ldp#Page';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#PageSortCriterion
 */
export const PageSortCriterion: Class = 'http://www.w3.org/ns/ldp#PageSortCriterion';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#MemberSubject
 */
export const MemberSubject: OtherIndividual = 'http://www.w3.org/ns/ldp#MemberSubject';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#PreferContainment
 */
export const PreferContainment: OtherIndividual = 'http://www.w3.org/ns/ldp#PreferContainment';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#PreferMembership
 */
export const PreferMembership: OtherIndividual = 'http://www.w3.org/ns/ldp#PreferMembership';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#PreferEmptyContainer
 */
export const PreferEmptyContainer: OtherIndividual = 'http://www.w3.org/ns/ldp#PreferEmptyContainer';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#PreferMinimalContainer
 */
export const PreferMinimalContainer: OtherIndividual = 'http://www.w3.org/ns/ldp#PreferMinimalContainer';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#Ascending
 */
export const Ascending: OtherIndividual = 'http://www.w3.org/ns/ldp#Ascending';

/**
 *
 *
 *
 *
 * http://www.w3.org/ns/ldp#Descending
 */
export const Descending: OtherIndividual = 'http://www.w3.org/ns/ldp#Descending';

export const _BASE: IriString = 'http://www.w3.org/ns/ldp#';
export const _PREFIX: string = 'ldp';

type IriString = `${'http' | 'https'}://${string}`;
type Property = IriString;
type Class = IriString;
type Datatype = IriString; // eslint-disable-line
type OwlClass = IriString; // eslint-disable-line
type OwlObjectProperty = IriString; // eslint-disable-line
type OwlDatatypeProperty = IriString; // eslint-disable-line
type HydraResource = IriString; // eslint-disable-line
type HydraClass = IriString; // eslint-disable-line
type HydraLink = IriString; // eslint-disable-line
type HydraTemplatedLink = IriString; // eslint-disable-line
type HydraVariableRepresentation = IriString; // eslint-disable-line
type OtherIndividual = IriString;

/**
 *
 *
 * Links together a tree:Node with a description of this search tree through the search tree itself or through a data service
 *
 * https://w3id.org/tree#viewDescription
 */
export const viewDescription: Property = 'https://w3id.org/tree#viewDescription';

/**
 * Relation
 *
 * Links a node with another through a Relation class
 *
 * https://w3id.org/tree#relation
 */
export const relation: Property = 'https://w3id.org/tree#relation';

/**
 * Remaining Items
 *
 * Total number of items of this node and its children
 *
 * https://w3id.org/tree#remainingItems
 */
export const remainingItems: Property = 'https://w3id.org/tree#remainingItems';

/**
 * Has node
 *
 * The URL to follow when this Node cannot be pruned
 *
 * https://w3id.org/tree#node
 */
export const node: Property = 'https://w3id.org/tree#node';

/**
 * Has Root Node
 *
 * A view has a root node that can be used to start traversing the search tree
 *
 * https://w3id.org/tree#rootNode
 */
export const rootNode: Property = 'https://w3id.org/tree#rootNode';

/**
 * Value
 *
 * The value the node linked in the node relation is compared to
 *
 * https://w3id.org/tree#value
 */
export const value: Property = 'https://w3id.org/tree#value';

/**
 * Path
 *
 * A property path, as defined by shacl, that indicates what resource the tree:value affects.
 *
 * https://w3id.org/tree#path
 */
export const path: Property = 'https://w3id.org/tree#path';

/**
 * View
 *
 * Links the collection to the current page.
 *
 * https://w3id.org/tree#view
 */
export const view: Property = 'https://w3id.org/tree#view';

/**
 * Member
 *
 * The collection has a member.
 *
 * https://w3id.org/tree#member
 */
export const member: Property = 'https://w3id.org/tree#member';

/**
 * Search
 *
 * The Node can be searched for child nodes.
 *
 * https://w3id.org/tree#search
 */
export const search: Property = 'https://w3id.org/tree#search';

/**
 * Shape
 *
 * The SHACL shape the members of the collection adhere to.
 *
 * https://w3id.org/tree#shape
 */
export const shape: Property = 'https://w3id.org/tree#shape';

/**
 * Import
 *
 * Imports a file in order being able to evaluate a tree:path correctly or comply fully to the tree:shape defined in the Collection
 * Note that `import` is a reserved Javascript keyword, and is therefore suffixed by `__workaround`.
 * For a list of reserved keywords, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords.
 *
 * https://w3id.org/tree#import
 */
export const import__workaround: Property = 'https://w3id.org/tree#import';

/**
 * Import conditionally
 *
 * Imports a file in order being able to evaluate a tree:path correctly
 *
 * https://w3id.org/tree#conditionalImport
 */
export const conditionalImport: Property = 'https://w3id.org/tree#conditionalImport';

/**
 * Zoom level
 *
 * The zoom level of the tile cfr. OSM convention
 *
 * https://w3id.org/tree#zoom
 */
export const zoom: Property = 'https://w3id.org/tree#zoom';

/**
 * The X tile number
 *
 * The X tile number from longitude cfr. OSM convention
 *
 * https://w3id.org/tree#longitudeTile
 */
export const longitudeTile: Property = 'https://w3id.org/tree#longitudeTile';

/**
 * The Y tile number
 *
 * The Y tile number from latitude cfr. OSM convention
 *
 * https://w3id.org/tree#latitudeTile
 */
export const latitudeTile: Property = 'https://w3id.org/tree#latitudeTile';

/**
 * Time Query
 *
 * Will search for elements starting from a certain timestamp
 *
 * https://w3id.org/tree#timeQuery
 */
export const timeQuery: Property = 'https://w3id.org/tree#timeQuery';

/**
 * Collection
 *
 * A tree:Collection is a collection containing members. The members may be spread across multiple tree:Nodes.
 *
 * https://w3id.org/tree#Collection
 */
export const Collection: Class = 'https://w3id.org/tree#Collection';

/**
 * Search Tree
 *
 * A tree:SearchTree publishes the members of a collection.
 *
 * https://w3id.org/tree#SearchTree
 */
export const SearchTree: Class = 'https://w3id.org/tree#SearchTree';

/**
 * Node
 *
 * A tree:Node is a node that may contain relations to other nodes.
 *
 * https://w3id.org/tree#Node
 */
export const Node: Class = 'https://w3id.org/tree#Node';

/**
 * Root Node
 *
 * A tree:RootNode is the access point into a search tree.
 *
 * https://w3id.org/tree#RootNode
 */
export const RootNode: Class = 'https://w3id.org/tree#RootNode';

/**
 * Relation
 *
 * A class describing the relation between two nodes
 *
 * https://w3id.org/tree#Relation
 */
export const Relation: Class = 'https://w3id.org/tree#Relation';

/**
 * Conditional Import
 *
 * Import a page when the tree:path is interesting for the client
 *
 * https://w3id.org/tree#ConditionalImport
 */
export const ConditionalImport: Class = 'https://w3id.org/tree#ConditionalImport';

/**
 * Prefix Relation
 *
 * All members of this related node start with this prefix
 *
 * https://w3id.org/tree#PrefixRelation
 */
export const PrefixRelation: Class = 'https://w3id.org/tree#PrefixRelation';

/**
 * Substring Relation
 *
 * All members of this related node contain this substring
 *
 * https://w3id.org/tree#SubstringRelation
 */
export const SubstringRelation: Class = 'https://w3id.org/tree#SubstringRelation';

/**
 * Suffix Relation
 *
 * All members of this related node end with this suffix
 *
 * https://w3id.org/tree#SuffixRelation
 */
export const SuffixRelation: Class = 'https://w3id.org/tree#SuffixRelation';

/**
 * Greater Than Relation
 *
 * All members of this related node are greater than the value
 *
 * https://w3id.org/tree#GreaterThanRelation
 */
export const GreaterThanRelation: Class = 'https://w3id.org/tree#GreaterThanRelation';

/**
 * Greater than or equal to relation
 *
 * All members of this related node are greater than or equal to the value
 *
 * https://w3id.org/tree#GreaterThanOrEqualToRelation
 */
export const GreaterThanOrEqualToRelation: Class = 'https://w3id.org/tree#GreaterThanOrEqualToRelation';

/**
 * Less Than Relation
 *
 *
 *
 * https://w3id.org/tree#LessThanRelation
 */
export const LessThanRelation: Class = 'https://w3id.org/tree#LessThanRelation';

/**
 * Less than or equal to Relation
 *
 *
 *
 * https://w3id.org/tree#LessThanOrEqualToRelation
 */
export const LessThanOrEqualToRelation: Class = 'https://w3id.org/tree#LessThanOrEqualToRelation';

/**
 * Equal To Relation
 *
 *
 *
 * https://w3id.org/tree#EqualToRelation
 */
export const EqualToRelation: Class = 'https://w3id.org/tree#EqualToRelation';

/**
 * Not Equal To Relation
 *
 *
 *
 * https://w3id.org/tree#NotEqualToRelation
 */
export const NotEqualToRelation: Class = 'https://w3id.org/tree#NotEqualToRelation';

/**
 * Geospatially Contains Relation
 *
 * All further members are geospatially contained within the WKT string of the tree:value.
 *
 * https://w3id.org/tree#GeospatiallyContainsRelation
 */
export const GeospatiallyContainsRelation: Class = 'https://w3id.org/tree#GeospatiallyContainsRelation';

/**
 * In Between Relation
 *
 * For comparing intervals: all further members are in-between the given interval
 *
 * https://w3id.org/tree#InBetweenRelation
 */
export const InBetweenRelation: Class = 'https://w3id.org/tree#InBetweenRelation';

/**
 * TREE
 *
 * A hypermedia specification for fragmenting collections of members.
 *
 * https://w3id.org/tree#Ontology
 */
export const Ontology: OtherIndividual = 'https://w3id.org/tree#Ontology';

export const _BASE: IriString = 'https://w3id.org/tree#';
export const _PREFIX: string = 'tree';

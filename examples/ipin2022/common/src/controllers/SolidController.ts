import { AngleUnit, DataObject, GeographicalPosition, LengthUnit, LinearVelocityUnit } from '@openhps/core';
import { 
    IriString, 
    RDFSerializer,
    DataFactory,
    Term
} from '@openhps/rdf/serialization';
import { vcard, ogc } from '@openhps/rdf/vocab';
import type { Bindings } from '@openhps/rdf/sparql';
import { SolidClientService, SolidDataDriver, } from '@openhps/solid/browser';
import {
    FeatureOfInterest, 
    Geometry, 
    ObservableProperty, 
    Observation, 
    PropertyAccuracy, 
    QuantityValue,
    GeolocationPosition
} from "../models";
import {
    getLiteral,
} from '@inrupt/solid-client';
import {
    LocalStorageDriver
} from '@openhps/localstorage';
import { EventEmitter } from 'events';
import type { SolidSession } from '@openhps/solid';
const wkt = require('wkt');

/**
 * Solid controller for handling remote data storage
 */
export class SolidController extends EventEmitter {
    protected service: SolidClientService;
    protected session: SolidSession;
    protected me: FeatureOfInterest;
    protected positionProperty: ObservableProperty;
    protected orientationProperty: ObservableProperty;
    protected velocityProperty: ObservableProperty;
    protected driver: SolidDataDriver<DataObject>;

    /**
     * Create a new Solid app
     *
     * @param {string} clientName Client name to show to the user when logging in
     */
    constructor(clientName: string) {
        super();
        this.service = new SolidClientService({
            clientName,
            dataServiceDriver: new LocalStorageDriver(String, {
                namespace: "example",
            })
        });
        this.driver = new SolidDataDriver(DataObject);
        this.service.emit("build");
        this.service.on("login", this.initialize.bind(this));
    }

    /**
     * Check if the current session is logged in
     */
    get isLoggedIn() {
        return this.session !== undefined && this.session.info.isLoggedIn;
    }

    /**
     * Get the property URI to use for data store
     *
     * @param session 
     * @param property 
     * @returns 
     */
    protected getPropertyURI(session: SolidSession, property: string): IriString {
        return this.service.getDocumentURL(session, `/properties/${property}.ttl`).href as IriString;
    }

    /**
     * Login to a Solid provider
     *
     * @param {IriString} issuer Solid issuer IRI
     */
    async login(issuer: IriString) {
        await this.service.login(issuer);
    }

    /**
     * Get the current session
     *
     * @returns {SolidSession} Solid session
     */
    getSession(): SolidSession {
        return this.service.session;
    }
    
    /**
     * Initialize the properties of the user
     */
    async initialize() {
        const session = this.getSession();
        const card = await this.service.getThing(session, session.info.webId);
        // User description
        this.me = new FeatureOfInterest(session.info.webId);
        this.positionProperty = new ObservableProperty(this.getPropertyURI(session, "position"));
        this.positionProperty.comment = `Geographical position of ${getLiteral(card, vcard.fn).value}`;
        this.positionProperty.label = "Geographical Position";
        this.positionProperty.featureOfInterest = this.me.value as IriString;
        const positionPropertyAccuracy = new PropertyAccuracy(this.getPropertyURI(session, "position") + "#accuracy");
        positionPropertyAccuracy.unit = LengthUnit.METER;
        positionPropertyAccuracy.minValue = -1;
        positionPropertyAccuracy.minValue = 1;
        positionPropertyAccuracy.forProperty = this.positionProperty;
        positionPropertyAccuracy.label = "Maximum accuracy";
        positionPropertyAccuracy.comment = "The maximum accuracy for the geographical position";

        this.orientationProperty = new ObservableProperty(this.getPropertyURI(session, "orientation"));
        this.orientationProperty.comment = `Orientation of ${getLiteral(card, vcard.fn).value}`;
        this.orientationProperty.label = "Orientation";
        this.orientationProperty.featureOfInterest = this.me.value as IriString;
        
        this.velocityProperty = new ObservableProperty(this.getPropertyURI(session, "velocity"));
        this.velocityProperty.comment = `Velocity of ${getLiteral(card, vcard.fn).value}`;
        this.velocityProperty.label = "Velocity";
        this.velocityProperty.featureOfInterest = this.me.value as IriString;

        this.me.properties.push(this.positionProperty);
        this.me.properties.push(this.orientationProperty);
        this.me.properties.push(this.velocityProperty);
        const subjects = await RDFSerializer.serializeToSubjects(this.me);
        subjects.forEach(subject => {
            this.service.setThing(session, subject);
        });
        this.service.setThing(session, RDFSerializer.serializeToSubjects(positionPropertyAccuracy)[0]);
        console.log("Created properties for", this.me.id);
        this.emit('ready');
    }

    /**
     * Update the position of a user
     *
     * @param data 
     * @returns 
     */
    async updatePosition(data: GeolocationPosition) {
        const session = await this.getSession();
        if (session === undefined) {
            return;
        }
        this.createPosition(session, data);
        this.createOrientation(session, data);
        this.createVelocity(session, data);
    }

    async findAllPositions(session: SolidSession, minAccuracy: number = 6, limit: number = 20): Promise<any[]> {
        const bindings = await this.driver.queryBindings(`
            PREFIX geosparql: <http://www.opengis.net/ont/geosparql#>
            PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
            PREFIX ssn: <http://www.w3.org/ns/ssn/>
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX qudt: <http://qudt.org/schema/qudt/>

            SELECT ?posGeoJSON ?datetime ?accuracy {
                ?profile a sosa:FeatureOfInterest ;
                        ssn:hasProperty ?property .
                ?observation sosa:hasResult ?result ;
                            sosa:observedProperty ?property ;
                            sosa:resultTime ?datetime .
                ?result a geosparql:Geometry ;
                        geosparql:hasSpatialAccuracy ?spatialAccuracy ;
                        geosparql:asWKT ?posWKT .
                BIND(geof:asGeoJSON(?posWKT) AS ?posGeoJSON)
                {
                    ?spatialAccuracy qudt:numericValue ?value ;
                                    qudt:unit ?unit .
                    OPTIONAL { ?unit qudt:conversionMultiplier ?multiplier }
                    OPTIONAL { ?unit qudt:conversionOffset ?offset }
                    BIND(COALESCE(?multiplier, 1) as ?multiplier)
                    BIND(COALESCE(?offset, 0) as ?offset)
                    BIND(((?value * ?multiplier) + ?offset) AS ?accuracy)
                    FILTER(?accuracy <= ${minAccuracy})
                }
            } ORDER BY DESC(?datetime) LIMIT ${limit}
        `, session, {
            extensionFunctions: {
                // GeoSPARQL 1.1 specification is still in draft
                // this is the implementation of the asGeoJSON function in the proposal
                'http://www.opengis.net/def/function/geosparql/asGeoJSON'(args: Term[]) {
                    const wktLiteral = args[0];
                    const pattern = /^<(https?:\/\/.*)>/g;
                    let wktString: string = wktLiteral.value.replace(pattern, "").replace("\n", "").trim();
                    const geoJSON = wkt.parse(wktString);
                    return DataFactory.literal(JSON.stringify(geoJSON), ogc.geoJSONLiteral);
                }
            }
        });
        return bindings.map((binding: Bindings) => {
            return binding.get("posGeoJSON").value
        });
    }

    async createPosition(session: SolidSession, data: GeolocationPosition) {
        const timestamp = new Date();
        const observation = new Observation(this.service.getDocumentURL(session, `/properties/position.ttl#${timestamp.getTime()}`).href);
        observation.featuresOfInterest.push(this.me);
        observation.resultTime = timestamp;
        observation.observedProperties.push(this.positionProperty);
        const accuracy = new QuantityValue();
        accuracy.numericValue = data.accuracy;
        accuracy.unit = LengthUnit.METER;
        const position = new Geometry();
        position.latitude = data.lnglat[1];
        position.longitude = data.lnglat[0];
        position.spatialAccuracy = accuracy;
        observation.results.push(position);
        await this.service.setThing(session, RDFSerializer.serializeToSubjects(observation)[0]);
    }
    
    async createOrientation(session: SolidSession, data: GeolocationPosition) {
        const timestamp = new Date();
        const observation = new Observation(this.service.getDocumentURL(session, `/properties/orientation.ttl#${timestamp.getTime()}`).href);
        observation.featuresOfInterest.push(this.me);
        observation.resultTime = timestamp;
        observation.observedProperties.push(this.orientationProperty);
        const accuracy = new QuantityValue();
        accuracy.numericValue = 20;
        accuracy.unit = AngleUnit.DEGREE;
        const value = new QuantityValue();
        value.unit = AngleUnit.DEGREE;
        value.numericValue = data.heading;
        observation.results.push(value);
        observation.usedProcedures.push("http://example.com/geolocationapi.ttl");
        await this.service.setThing(session, RDFSerializer.serializeToSubjects(observation)[0]);
    }

    async createVelocity(session: SolidSession, data: GeolocationPosition) {
        const timestamp = new Date();
        const observation = new Observation(this.service.getDocumentURL(session, `/properties/velocity.ttl#${timestamp.getTime()}`).href);
        observation.featuresOfInterest.push(this.me);
        observation.resultTime = timestamp;
        observation.observedProperties.push(this.velocityProperty);
        const accuracy = new QuantityValue();
        accuracy.numericValue = 1;
        accuracy.unit = LinearVelocityUnit.METER_PER_SECOND;
        const value = new QuantityValue();
        value.unit = LinearVelocityUnit.METER_PER_SECOND;
        value.numericValue = data.speed;
        observation.results.push(value);
        observation.usedProcedures.push("http://example.com/geolocationapi.ttl");
        await this.service.setThing(session, RDFSerializer.serializeToSubjects(observation)[0]);
    }
}
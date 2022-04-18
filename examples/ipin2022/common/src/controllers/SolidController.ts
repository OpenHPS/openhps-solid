import { AngleUnit, DataObject, LengthUnit, LinearVelocityUnit } from '@openhps/core';
import { 
    IriString, 
    RDFSerializer,
    DataFactory,
    Store
} from '@openhps/rdf/serialization';
import { vcard, rdf, sosa } from '@openhps/rdf/vocab';
import { SolidClientService, SolidDataDriver } from '@openhps/solid/browser';
import {
    FeatureOfInterest, 
    Geometry, 
    ObservableProperty, 
    Observation, 
    PropertyAccuracy, 
    QuantityValue,
} from "../models";
import {
    getLiteral,
} from '@inrupt/solid-client';
import {
    LocalStorageDriver
} from '@openhps/localstorage';
import EventEmitter from 'events';
import type { SolidSession } from '@openhps/solid';

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

    constructor(clientName: string) {
        super();
        this.service = new SolidClientService({
            clientName,
            dataServiceDriver: new LocalStorageDriver(String, {
                namespace: "example",
            })
        });
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

    async updatePosition(data: any) {
        const session = await this.getSession();
        if (session === undefined) {
            return;
        }
        this.createPosition(session, data);
        this.createOrientation(session, data);
        this.createVelocity(session, data);

    }
    
    async findPosition(session: SolidSession): Promise<Geometry> {
        this.service.getThing(session, this.getPropertyURI(session, "position"));

        return undefined;
    }

    async findAllPositions(session: SolidSession): Promise<Geometry[]> {
        const dataset: Store = await this.service.getDatasetStore(session, this.getPropertyURI(session, "position"));
        console.log(dataset.getSubjects(DataFactory.namedNode(rdf.type), DataFactory.namedNode(sosa.Observation), null));
        return undefined;
    }

    async findAllOrientations(session: SolidSession): Promise<QuantityValue[]> {
        return undefined;
    }

    async findAllVelocities(session: SolidSession): Promise<QuantityValue[]> {
        return undefined;
    }

    async createPosition(session: SolidSession, data: any) {
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
        await this.service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
    }
    
    async createOrientation(session: SolidSession, data: any) {
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
        await this.service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
    }

    async createVelocity(session: SolidSession, data: any) {
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
        await this.service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
    }
}

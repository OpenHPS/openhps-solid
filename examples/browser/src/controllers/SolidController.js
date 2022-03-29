import { AngleUnit, LengthUnit } from '@openhps/core';
import { RDFSerializer, vcard } from '@openhps/rdf';
import { SolidClientService } from '@openhps/solid/browser';
import {
    FeatureOfInterest, 
    Geometry, 
    ObservableProperty, 
    Observation, 
    QuantityValue,
} from "openhps-solid-common";
import {
    getLiteral,
} from '@inrupt/solid-client';
import {
    LocalStorageDriver
} from '@openhps/localstorage';
import EventEmitter from 'events';

export class SolidController extends EventEmitter {
    constructor(clientName) {
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

    get isLoggedIn() {
        return this.session !== undefined;
    }

    async login(issuer) {
        await this.service.login(issuer);
    }

    async getSession() {
        return await this.service.session;
    }
    
    async initialize() {
        const session = await this.getSession();
        const card = await this.service.getThing(session, session.info.webId);
        // User description
        this.me = new FeatureOfInterest(session.info.webId);
        this.positionProperty = new ObservableProperty(this.service.getDocumentURL(session, `/properties/position.ttl`).href);
        this.positionProperty.comment = `Geographical position of ${getLiteral(card, vcard.fn).value}`;
        this.positionProperty.label = "Geographical Position";
        this.positionProperty.featureOfInterest = this.me.value;
        this.orientationProperty = new ObservableProperty(this.service.getDocumentURL(session, `/properties/orientation.ttl`).href);
        this.orientationProperty.comment = `Orientation of ${getLiteral(card, vcard.fn).value}`;
        this.orientationProperty.label = "Orientation";
        this.orientationProperty.featureOfInterest = this.me.value;

        this.me.properties.push(this.positionProperty);
        this.me.properties.push(this.orientationProperty);
        const subjects = await RDFSerializer.serializeToSubjects(this.me);
        subjects.forEach(subject => {
            this.service.setThing(session, subject);
        });
        console.log("Created properties for", this.me.id);
        this.emit('ready');
    }

    async updatePosition(data) {
        const session = await this.getSession();
        if (session === undefined) {
            return;
        }
        this.createPosition(session, data);
        this.createOrientation(session, data);
    }
    
    async createPosition(session, data) {
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
        console.log(await RDFSerializer.stringify(observation));
        await this.service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
    }
    
    async createOrientation(session, data) {
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
        value.value = data.heading;
        observation.results.push(value);
        await this.service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
    }
}

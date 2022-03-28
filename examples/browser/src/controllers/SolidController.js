import { LengthUnit } from '@openhps/core';
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

export class SolidController {
    constructor(clientName) {
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
        this.positionProperty = new ObservableProperty(this.service.getDocumentURL(session, `/public/position.ttl`).href);
        this.positionProperty.comment = `Geographical position of ${getLiteral(card, vcard.fn).value}`;
        this.positionProperty.label = "Geographical Position";
        this.positionProperty.featureOfInterest = this.me.value;
        this.me.properties.push(this.positionProperty);
        const subjects = await RDFSerializer.serializeToSubjects(this.me);
        subjects.forEach(subject => {
            this.service.setThing(session, subject);
        });
        console.log("Updated " + this.me.id)
    }

    async updatePosition(data) {
        const session = await this.getSession();
        console.log("update position", data);
        if (session === undefined) {
            return;
        }
        const timestamp = new Date();
        const observation = new Observation(this.service.getDocumentURL(session, `/public/position.ttl#${timestamp.getTime()}`).href);
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
        console.log("Updated position", this.positionProperty.id)
        await this.service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
    }
}

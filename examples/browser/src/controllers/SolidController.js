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
            dataServiceDriver: new LocalStorageDriver(String)
        });
        this.service.emit("build");
    }

    async login(webId) {
        await this.service.login(webId);
        this.webId = webId;
    }

    async getSession() {
        return await this.service.findSessionByWebId(this.webId);
    }
    
    async initialize() {
        const session = await this.getSession();
        const card = await this.service.getThing(session, this.webId);
        // User description
        this.me = new FeatureOfInterest(this.webId);
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

    async updatePosition(lnglat) {
        const session = await this.getSession();
        console.log(session);
        if (session === undefined) {
            return;
        }
        const timestamp = new Date();
        const observation = new Observation(this.service.getDocumentURL(session, `/public/position.ttl#${timestamp.getTime()}`).href);
        observation.featuresOfInterest.push(this.me);
        observation.resultTime = timestamp;
        observation.observedProperties.push(this.positionProperty);
        const accuracy = new QuantityValue();
        accuracy.numericValue = 2;
        accuracy.unit = LengthUnit.METER;
        const position = new Geometry();
        position.latitude = lnglat[1];
        position.longitude = lnglat[0];
        position.spatialAccuracy = accuracy;
        observation.results.push(position);
        console.log("Updated position", this.positionProperty.id)
        await this.service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
    }
}

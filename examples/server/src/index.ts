import express from "express";
import { DataObject, DataObjectService, LengthUnit, ModelBuilder } from '@openhps/core';
import { SolidClientService, SolidDataDriver, SolidService } from '@openhps/solid';
import { FeatureOfInterest, Geometry, ObservableProperty, Observation, QuantityValue } from "openhps-solid-common";
import { IriString, RDFSerializer, vcard } from "@openhps/rdf";
import { getLiteral } from "@inrupt/solid-client";

ModelBuilder.create()
  .addService(new SolidClientService({
    loginPath: "/login",
    redirectPath: "/redirect",
    defaultOidcIssuer: "https://solidweb.org/",
    redirectUrl: "http://localhost:3030/redirect",
    authServer: {
      port: 3030
    },
    loginSuccessCallback: async function(req: express.Request, res: express.Response, sessionInfo: any) {
      const service: SolidService = this;

      const session = await service.findSessionByWebId(sessionInfo.webId);
      const card = await service.getThing(session, sessionInfo.webId);
      // User description
      const me = new FeatureOfInterest(sessionInfo.webId);
      const positionProperty = new ObservableProperty(service.getDocumentURL(session, `/public/position.ttl`).href as any);
      positionProperty.comment = `Geographical position of ${getLiteral(card, vcard.fn).value}`;
      positionProperty.label = "Geographical Position";
      positionProperty.featureOfInterest = me.value as IriString;
      me.properties.push(positionProperty);
      const subjects = await RDFSerializer.serializeToSubjects(me);
      subjects.forEach(subject => {
        service.setThing(session, subject);
      });
      const timestamp = new Date();
      const observation = new Observation(service.getDocumentURL(session, `/public/position.ttl#${timestamp.getTime()}`).href as any);
      observation.featuresOfInterest.push(me);
      observation.resultTime = timestamp;
      observation.observedProperties.push(positionProperty);
      const accuracy = new QuantityValue();
      accuracy.numericValue = 2;
      accuracy.unit = LengthUnit.METER;
      const position = new Geometry();
      position.latitude = 50.82745769159339;
      position.longitude = 4.401524003636928;
      position.spatialAccuracy = accuracy;
      observation.results.push(position);
      await service.setThing(session, await RDFSerializer.serializeToSubjects(observation)[0]);
      res.send("OK " + JSON.stringify(sessionInfo));
    },
    loginErrorCallback: (req: express.Request, res: express.Response, sessionInfo: any, reason: any) => {
      res.send("error: " + reason);
    }
  }))
  .addService(new DataObjectService(new SolidDataDriver(DataObject)))
  .from()
  .to()
  .build();

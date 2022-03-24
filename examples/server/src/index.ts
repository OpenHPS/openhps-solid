import express from "express";
import { DataObject, DataObjectService, ModelBuilder } from '@openhps/core';
import { SolidClientService, SolidDataDriver, SolidSession } from '@openhps/solid';

ModelBuilder.create()
  .addService(new SolidClientService({
    loginPath: "/login",
    redirectPath: "/redirect",
    defaultOidcIssuer: "https://solidweb.org/",
    redirectUrl: "http://localhost:3030/redirect",
    authServer: {
      port: 3030
    },
    loginSuccessCallback: function(req: express.Request, res: express.Response, sessionInfo: any) {
      this.findSessionByWebId(sessionInfo.webId)
        .then((session: SolidSession) => {
          return this.getThing(session, "/public/detaillocation.ttl");
        }).then(console.log).catch(console.error);
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

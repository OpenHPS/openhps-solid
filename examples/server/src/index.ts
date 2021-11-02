import express from "express";
import { DataObject, DataObjectService, ModelBuilder } from '@openhps/core';
import { SolidClientService, SolidDataDriver } from '@openhps/solid';

ModelBuilder.create()
  .addService(new SolidClientService({
    loginPath: "/login",
    redirectPath: "/redirect",
    defaultOidcIssuer: "https://solidweb.org/",
    redirectUrl: "http://localhost:3030/redirect",
    authServer: {
      port: 3030
    },
    loginSuccessCallback: (req: express.Request, res: express.Response, sessionInfo: any) => {
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

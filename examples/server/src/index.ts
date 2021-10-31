import express from "express";
import cookieSession from "cookie-session";
import { DataObject, DataObjectService, ModelBuilder } from '@openhps/core';
import { SolidDataClient, SolidDataDriver } from '@openhps/solid';

const app = express();
app.use(
    cookieSession({
      name: "session",
      // These keys are required by cookie-session to sign the cookies.
      keys: [
        "Required, but value not relevant for this demo - key1",
        "Required, but value not relevant for this demo - key2",
      ],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
);

app.listen(3030, () => {
  console.log("Listening on http://localhost:3030 ...");
});

ModelBuilder.create()
  .addService(new SolidDataClient({
    loginPath: "/login",
    redirectPath: "/redirect",
    defaultOidcIssuer: "https://solidweb.org/",
    redirectUrl: "http://localhost:3030/redirect",
    express: app,
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

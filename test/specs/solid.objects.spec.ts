import { expect } from 'chai';
import { SolidClientService, SolidDataDriver } from '../../src';
import { Accelerometer, DataFrame, DataFrameService, DataObject, DataObjectService, Model, ModelBuilder } from '@openhps/core';
require('dotenv').config();

describe('SolidDataDriver', () => {
    let model: Model<any>;

    before(async () => {
        model = await ModelBuilder.create()
            .addService(new SolidClientService({
                clientName: "OpenHPS",
                clientId: process.env.clientId,
                clientSecret: process.env.clientSecret,
                defaultOidcIssuer: "https://login.inrupt.com/",
                autoLogin: true
            }))
            .addService(new DataObjectService(new SolidDataDriver(DataObject)))
            .addService(new DataFrameService(new SolidDataDriver(DataFrame)))
            .from()
            .to()
            .build();
    });

    describe('insert', () => {

        it('should insert objects that contain a webId', (done) => {
            const sensor = new Accelerometer("mysensor");
            sensor.frequency = 50;
            sensor.webId = "https://id.inrupt.com/maximvdw/profile/card#me";
            sensor.rdf = {
                uri: "https://id.inrupt.com/maximvdw/sensors/test.ttl#mysensor",
            };
            model.findDataService(DataObject)
                .insert(sensor.uid, sensor).then(result => {
                    console.log(result);
                }).catch(done);
        });

    });
});

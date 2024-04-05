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
                defaultOidcIssuer: "https://solid.maximvdw.be/",
                autoLogin: true
            }))
            .addService(new DataObjectService(new SolidDataDriver(DataObject)))
            .addService(new DataFrameService(new SolidDataDriver(DataFrame)))
            .from()
            .to()
            .build();
    });

    after(() => {
        model.emit('destroy');
    });

    describe('insert', () => {

        it('should insert objects that contain a webId', (done) => {
            const session = model.findService(SolidClientService).session;

            const sensor = new Accelerometer("mysensor");
            sensor.frequency = 50;
            sensor.webId = session.info.webId;
            sensor.rdf = {
                path: `sensors/test2.ttl` as any,
            };
            model.findDataService(DataObject)
                .insert(sensor.uid, sensor).then(result => {
                    // Delete again to make Inrupt happy <3
                    return model.findDataService(DataObject).delete(sensor.uid);
                }).then(() => {
                    done();
                }).catch(done);
        });

    });
});

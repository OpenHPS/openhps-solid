import 'mocha';
import { PropertyType, SolidClientService, SolidProfileObject, SolidPropertyService, SolidPropertySink, SolidService } from '../../src';
import { DataFrame, DataObject, GeographicalPosition, Model, ModelBuilder } from '@openhps/core';
require('dotenv').config();

describe('SolidPropertySink', () => {
    let model: Model;

    before((done) => {
        ModelBuilder.create()
            .addService(new SolidPropertyService((node) => {
                return node.collection ? node.collection.members.length < 50 : true;
            }))
            .addService(new SolidClientService({
                clientName: "OpenHPS",
                defaultOidcIssuer: "https://solid.maximvdw.be/",
                clientId: process.env.clientId,
                clientSecret: process.env.clientSecret,
                autoLogin: true
            }))
            .from()
            .to(new SolidPropertySink({
                properties: [PropertyType.POSITION]
            }))
            .build().then((m) => {
                model = m;
                done();
            }).catch(done);
    });

    it('should write a position property', (done) => {
        const session = model.findService(SolidClientService).session;
        const object = new SolidProfileObject(session.info.webId, "Maxim Van de Wynckel");
        object.setPosition(new GeographicalPosition(51.2194475, 4.4024643));
        const frame = new DataFrame(object);
        model.once('error', done);
        model.once('completed', () => {
            done();
        });
        model.push(frame).then(() => {

        }).catch(done);
    });

});

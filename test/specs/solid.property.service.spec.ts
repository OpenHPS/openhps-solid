import 'mocha';
import { expect } from 'chai';
import { SolidClientService, SolidProfileObject, SolidPropertyService, SolidSession } from '../../src';
import { Property } from '@openhps/rdf';
require('dotenv').config();

describe('SolidPropertyService', () => {
    let service: SolidPropertyService;
    let session: SolidSession;
    let clientService = new SolidClientService({
        clientName: "OpenHPS",
        clientId: process.env.clientId,
        clientSecret: process.env.clientSecret,
    });

    before((done) => {
        service = new SolidPropertyService();
        clientService.login("https://solid.maximvdw.be/").then(s => {
            expect(s).to.not.be.undefined;
            expect(s.info.isLoggedIn).to.be.true;
            session = s;
            done();
        }).catch(done);
    });

    describe('fetching properties', () => {
        it('should fetch properties from a profile', (done) => {
            const profile = new SolidProfileObject("https://maximvdw.solidweb.org/profile/card#me");
            service.fetchProperties(session, profile).then(properties => {
                expect(properties).to.have.lengthOf(0);
                done();
            }).catch(done);
        });
    });
    
    describe('creating properties', () => {
        it('should create a new property', (done) => {
            // service.createProperty(session, new Property()).then(property => {
            //     expect(property).to.be.a('string');
            //     done();
            // }).catch(done);
        });
    });
});

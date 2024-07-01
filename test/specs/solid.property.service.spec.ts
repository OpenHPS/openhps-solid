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
            return service.emitAsync('build');
        }).then(() => {
            service.service = clientService;
            done();
        }).catch(done);
    });

    describe('fetching properties', () => {
        it('should fetch properties from a profile', (done) => {
            const profile = new SolidProfileObject("https://maximvdw.solidweb.org/profile/card#me");
            service.fetchProperties(session, profile).then(properties => {
                expect(properties).to.have.lengthOf(3);
                done();
            }).catch(done);
        });
    });

    describe('fetching observations', () => {
        it('should fetch observations from a property', (done) => {
            const profile = new SolidProfileObject("https://maximvdw.solidweb.org/profile/card#me");
            service.fetchProperties(session, profile).then(properties => {
                return service.fetchObservations(session, properties[1]);
            }).then(observations => {
                expect(observations).to.have.lengthOf.greaterThan(1);
                done();
            }).catch(done);
        });

        it('should fetch observations from a property after a specific time', (done) => {
            const profile = new SolidProfileObject("https://maximvdw.solidweb.org/profile/card#me");
            service.fetchProperties(session, profile).then(properties => {
                return service.fetchObservations(session, properties[1], new Date(1660049151686));
            }).then(observations => {
                expect(observations).to.have.lengthOf.greaterThan(1);
                done();
            }).catch(done);
        });
    });
    
    describe('creating properties', () => {
        it('should create a new property', (done) => {
            const property = new Property();
            service.createProperty(session, new Property()).then(property => {
                expect(property).to.be.a('string');
                done();
            }).catch(done);
        });
    });
});

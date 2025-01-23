import 'mocha';
import { expect } from 'chai';
import { SolidClientService, SolidProfileObject, SolidPropertyService, SolidSession } from '../../src';
import { Observation, Property } from '@openhps/rdf';
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
        service = new SolidPropertyService((node) => {
            return node.collection ? node.collection.members.length < 3 : true;
        });
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

    after((done) => {
        service.service.deleteRecursively(session, "https://solid.maximvdw.be/properties/test").then(() => {
            return clientService.logout(session);
        }).then(() => {
            return Promise.all([service.emitAsync('destroy'), clientService.emitAsync('destroy')]);
        }).then(() => {
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
            const property = new Property("https://solid.maximvdw.be/properties/test");
            service.createProperty(session, property).then(property => {
                setTimeout(() => {
                    done();
                }, 5000);
            }).catch(done);
        });
    });

    describe('creating observations', () => {
        it('should create a new observation', (done) => {
            const property = new Property("https://solid.maximvdw.be/properties/test");
            const observation = new Observation();
            observation.resultTime = new Date();
            observation.usedProcedures = ["https://solid.maximvdw.be/procedures/test"];
            service.addObservation(session, property, observation).then(observation => {
                setTimeout(() => {
                    done();
                }, 2000);
            }).catch(done);
        });

        it('should be able to add multiple observations', (done) => {
            const property = new Property("https://solid.maximvdw.be/properties/test");
            const date = new Date();
            (async () => {
                for (let i = 0; i < 10; i++) {
                    const observation = new Observation();
                    observation.resultTime = new Date(date.getTime() + i * 1000);
                    observation.usedProcedures = ["https://solid.maximvdw.be/procedures/test"];
                    await service.addObservation(session, property, observation);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                done();
            })().catch(done);
        }).timeout(60000);

        it('should be able to fetch multiple observations', (done) => {
            const property = new Property("https://solid.maximvdw.be/properties/test");
            service.fetchObservations(session, property).then(observations => {
                // expect(observations).to.have.lengthOf(11);
                done();
            }).catch(done);
        });
    });
});

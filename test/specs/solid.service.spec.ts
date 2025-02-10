import 'mocha';
import { expect } from 'chai';
import { SolidClientService, SolidSession } from '../../src';
import { IriString, RDFSerializer } from '@openhps/rdf';
import { ModelBuilder } from '@openhps/core';
import { generate } from '../utils/secret';
import { SerializableThing } from '@openhps/rdf';

require('dotenv').config();

describe('SolidService', () => {
    let service: SolidClientService;
    let solidServices: SolidClientService[] = [];
    
    before((done) => {
        service = new SolidClientService(undefined);
        Promise.all([
            generate('http://localhost:3000', 'test1', 'test1@test.com', 'test123'),
            generate('http://localhost:3001', 'test2', 'test2@test.com', 'test123'),
            generate('http://localhost:3002', 'test3', 'test3@test.com', 'test123'),
        ])
            .then((secrets) => {
                solidServices = secrets.map((secret, i) => {
                    const oidcIssuer = `http://localhost:${3000 + i}`;
                    return new SolidClientService({
                        clientId: secret.id,
                        clientSecret: secret.secret,
                        clientName: 'OpenHPS',
                        defaultOidcIssuer: oidcIssuer,
                        autoLogin: true,
                    });
                });
                return Promise.all(
                    solidServices.map((service, i) => {
                        return ModelBuilder.create()
                            .addService(service) // Solid service
                            .withLogger(console.log)
                            .build();
                    }),
                );
            }).then(() => {
                done();
            }).catch(done);
    });

    after(() => {
        service.emit('destroy');
    });

    it('should emit a ready event', (done) => {
        const service = new SolidClientService({
            clientName: "OpenHPS",
            clientId: process.env.clientId,
            clientSecret: process.env.clientSecret,
            defaultOidcIssuer: "https://solid.maximvdw.be/",
            autoLogin: true
        });
        ModelBuilder.create()
            .addService(service)
            .build();
        service.once('ready', () => {
            done();
        });
    });

    it('should support webids with a subdomain', async () => {
        let webId = "https://maximvdw.solidweb.org/profile/card#me";
        let url = await service.getDocumentURL({ info: { webId }} as any, "/properties/position.ttl");
        expect(url.href).to.equal("https://maximvdw.solidweb.org/properties/position.ttl");

        url = await service.getDocumentURL({ info: { webId }} as any, webId);
        expect(url.href).to.equal(webId);
    });

    it('should support webids with a subpath', async () => {
        let webId = "https://id.inrupt.com/maximvdw";
        let url = await service.getDocumentURL({ info: { webId }} as any, "/properties/position.ttl");
        expect(url.href).to.not.equal("https://id.inrupt.com/maximvdw/properties/position.ttl");

        url = await service.getDocumentURL({ info: { webId }} as any, "/profile/card#me");
        expect(url.href).to.equal("https://storage.inrupt.com/d4a398b1-6f70-4ceb-9eed-6e638429995b/profile/card#me");
    });
    
    it('should login with a clientId and clientSecret', (done) => {
        const service = new SolidClientService({
            clientName: "OpenHPS",
            clientId: process.env.clientId,
            clientSecret: process.env.clientSecret,
        });
        service.login("https://solid.maximvdw.be/").then(session => {
            expect(session).to.not.be.undefined;
            expect(session.info.isLoggedIn).to.be.true;
            session.logout();
            done();
        }).catch(done);
    });
    

    describe('access', () => {
        let session: SolidSession;
        let containerURL: IriString;

        before((done) => {
            const service = new SolidClientService({
                clientName: "OpenHPS",
                clientId: process.env.clientId,
                clientSecret: process.env.clientSecret,
            });
            service.login("https://solid.maximvdw.be/").then(s => {
                session = s;
                expect(session).to.not.be.undefined;
                expect(session.info.isLoggedIn).to.be.true;
                return service.getDocumentURL(session, "/test/abc/");
            }).then(url => {
                containerURL = url.href as IriString;
                // Create container
                return service.createContainer(session, containerURL as IriString);
            }).then(acl => {
                done();
            }).catch(done);
        });

        after((done) => {
            service.deleteContainer(session, containerURL as IriString).then(() => {
                return session.logout();
            }).then(() => {
                done();
            }).catch(done);
        });

        it('should set access for itself', (done) => {
            service.setAccess(containerURL, {
                read: true,
                write: true,
                append: true,
                controlRead: true,
                controlWrite: true,
            }, session.info.webId, session).then(() => {
                done();
            }).catch(done);
        });

        it('should be able to retrieve the acl of a document', (done) => {
            service.getAccess(containerURL, session.info.webId, session).then(access => {
                done();
            }).catch(done);
        });
        
        it('should not throw an error when creating an existing container', (done) => {
            service.getDocumentURL(session, "/test/abc/").then(url => {
                return service.createContainer(session, url.href as IriString);
            }).then(() => {
                done();
            }).catch(done);
        });

        it('should create append access rights for a container', (done) => {
            // Create a new container
            const service = solidServices[0];
            const session = service.session;
            let containerURL: IriString = "http://localhost:3000/test1/abc/";
            service.createContainer(session, containerURL).then(() => {
                // Set access rights
                return service.setAccess(containerURL, {
                    append: true,
                    read: true,
                    default: true,
                    public: true
                });
            }).then(() => {
                // Create a new resource using session 2
                const service2 = solidServices[1];
                const session2 = service2.session;
                const obj = new SerializableThing(`http://localhost:3000/test1/abc/${new Date().getTime()}.ttl`);
                obj.label = "Hello World";
                const store = RDFSerializer.serializeToStore(obj);
                return service2.saveDataset(session2, `http://localhost:3000/test1/abc/${new Date().getTime()}.ttl`, store, true);
            }).then((dataset) => {
                const uri = dataset.internal_resourceInfo.sourceIri;
                // Verify that the item has content
                return service.getDatasetStore(session, uri);
            }).then((store) => {
                expect(store).to.not.be.undefined;
                expect(store.size).to.be.greaterThan(0);
                done();
            }).catch(done);
        });
    });

    describe('dataset subscription', () => {
        it('should get a legacy dataset subscription', (done) => {
            service.getDatasetSubscription(undefined, `https://maximvdw.solidweb.org/properties/position.ttl`).then(listener => {
                listener.close();
                done();
            }).catch(done);
        }).timeout(100000000);
    
        it('should get a websocket2023 dataset subscription (message)', (done) => {
            const service = solidServices[0];
            const session = service.session;
            let containerURL: IriString = "http://localhost:3000/test1/abc/";
            service.getDatasetSubscription(undefined, containerURL).then(listener => {
                listener.on('message', (msg) => {
                    listener.close();
                    done();
                });
                return service.saveDataset(session, containerURL, service.createDataset(), true);
            }).catch(done);
        }).timeout(100000000);

        it('should get a websocket2023 dataset subscription (activity)', (done) => {
            const service = solidServices[0];
            const session = service.session;
            let containerURL: IriString = "http://localhost:3000/test1/abc/";
            service.getDatasetSubscription(undefined, containerURL).then(listener => {
                listener.on('activity', (msg) => {
                    console.log(msg);
                    listener.close();
                    done();
                });
                listener.once('error', (error) => {
                    done(error);
                });
                return service.saveDataset(session, containerURL, service.createDataset(), true);
            }).catch(done);
        }).timeout(100000000);
    });
});

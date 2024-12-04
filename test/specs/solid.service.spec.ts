import 'mocha';
import { expect } from 'chai';
import { SolidClientService, SolidSession } from '../../src';
import { IriString } from '@openhps/rdf';
import { ModelBuilder } from '@openhps/core';
require('dotenv').config();

describe('SolidService', () => {
    let service: SolidClientService;
    
    before((done) => {
        service = new SolidClientService(undefined);
        done();
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

    it('should get a dataset subscription', (done) => {
        service.getDatasetSubscription(undefined, `https://maximvdw.solidweb.org/properties/position.ttl`).then(listener => {
            listener.close();
            done();
        }).catch(done);
    }).timeout(100000000);

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
        
    });
});

import 'mocha';
import { expect } from 'chai';
import { SolidClientService } from '../../src';
require('dotenv').config();

describe('SolidService', () => {
    let service: SolidClientService;
    
    before((done) => {
        service = new SolidClientService(undefined);
        done();
    });

    it('should get a dataset subscription', (done) => {
        service.getDatasetSubscription(undefined, `https://maximvdw.solidweb.org/properties/position.ttl`).then(listener => {
            listener.close();
            done();
        }).catch(done);
    }).timeout(100000000);

    it('should support webids with a subdomain', () => {
        let webId = "https://maximvdw.solidweb.org/profile/card#me";
        let url = service.getDocumentURL({ info: { webId }} as any, "/properties/position.ttl");
        expect(url.href).to.equal("https://maximvdw.solidweb.org/properties/position.ttl");

        url = service.getDocumentURL({ info: { webId }} as any, webId);
        expect(url.href).to.equal(webId);
    });

    it('should support webids with a subpath', () => {
        let webId = "https://id.inrupt.com/maximvdw/profile/card#me";
        let url = service.getDocumentURL({ info: { webId }} as any, "/properties/position.ttl");
        expect(url.href).to.equal("https://id.inrupt.com/maximvdw/properties/position.ttl");

        url = service.getDocumentURL({ info: { webId }} as any, webId);
        expect(url.href).to.equal(webId);
    });
    
    it('should login with a clientId and clientSecret', (done) => {
        const service = new SolidClientService({
            clientName: "OpenHPS",
            clientId: process.env.clientId,
            clientSecret: process.env.clientSecret,
        });
        service.interactiveLogin("https://login.inrupt.com/").then(session => {
            expect(session).to.not.be.undefined;
            expect(session.info.isLoggedIn).to.be.true;
            session.logout();
            done();
        }).catch(done);
    });
    
});

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

    after(() => {
        service.emit('destroy');
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
        service.login("https://login.inrupt.com/").then(session => {
            expect(session).to.not.be.undefined;
            expect(session.info.isLoggedIn).to.be.true;
            session.logout();
            done();
        }).catch(done);
    });
    
});

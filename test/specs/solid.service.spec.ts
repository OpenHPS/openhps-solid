import 'mocha';
import { expect } from 'chai';
import { SolidClientService } from '../../src';

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
    
});

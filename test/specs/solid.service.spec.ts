import 'mocha';
import { expect } from 'chai';
import { SolidClientService } from '../../src';

describe('SolidService', () => {
    let service: SolidClientService;
    
    before((done) => {
        service = new SolidClientService(undefined);
        done();
    });
    
});

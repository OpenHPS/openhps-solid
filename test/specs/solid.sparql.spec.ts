import 'mocha';
import { expect } from 'chai';
import { SolidDataDriver } from '../../src';
import { DataObject } from '@openhps/core';
import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';

describe('SolidDataDriver', () => {
    let driver: SolidDataDriver<any>;
    
    before(async () => {
        driver = new SolidDataDriver(DataObject, {
            sources: ["http://maximvdw.solidweb.org/profile/card#me"],
            lenient: true,
        });
        await driver.emitAsync('build');
    });

    describe('querying', () => {
        it('should support simple queries on the source', (done) => {
            driver.queryBindings(`
            SELECT ?x ?y ?z {
                ?x ?y ?z .
            } LIMIT 50
            `).then(rows => {
                expect(rows.length).to.be.greaterThan(10);
                done();
            }).catch(done);
        });
        
        it('should support traversal queries on the source', (done) => {
            new QueryEngine().queryBindings(`
            PREFIX sosa: <http://www.w3.org/ns/sosa/>
            PREFIX ssn: <http://www.w3.org/ns/ssn/>
            
            SELECT ?result {
                ?profile     a sosa:FeatureOfInterest ;
                        ssn:hasProperty ?property .
                ?property a sosa:ObservableProperty .
                ?observation    a sosa:Observation ;
                                sosa:hasResult ?result .
            }
            `, {
                lenient: true,
                sources: ["https://maximvdw.solidweb.org/profile/card"],
            }).then((stream) => {
                const bindings = [];
                stream.on('data', (binding) => {
                    bindings.push(binding);
                });
                stream.on('end', () => {
                    //expect(bindings.length).to.be.greaterThan(5);
                    done();
                });
                stream.on('error', done);
            }).catch(done);
        });
    });

});

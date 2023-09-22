import 'mocha';
import { expect } from 'chai';
import { SolidDataDriver } from '../../src';
import { DataObject } from '@openhps/core';

describe('SolidDataDriver', () => {
    let driver: SolidDataDriver<any>;
    
    before(async () => {
        driver = new SolidDataDriver(DataObject, {
            sources: ["https://maximvdw.solidweb.org/profile/card#me"],
            lenient: true,
        });
        await driver.emitAsync('build');
    });

    after(() => {
        driver.emit('destroy');
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
            driver.engine.invalidateHttpCache();
            driver.queryBindings(`
                PREFIX geosparql: <http://www.opengis.net/ont/geosparql#>
                PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
                PREFIX ssn: <http://www.w3.org/ns/ssn/>
                PREFIX sosa: <http://www.w3.org/ns/sosa/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX qudt: <http://qudt.org/schema/qudt/>

                SELECT ?posWKT ?datetime ?accuracy
                {
                    ?profile ssn:hasProperty ?property .
                    {?observation sosa:observedProperty ?property ;
                                sosa:resultTime ?datetime ;
                                sosa:hasResult ?result .
                    ?result geosparql:hasSpatialAccuracy ?spatialAccuracy ;
                            geosparql:asWKT ?posWKT .
                    ?spatialAccuracy qudt:numericValue ?value ;
                                    qudt:unit ?unit .
                    OPTIONAL { ?unit qudt:conversionMultiplier ?multiplier }
                    OPTIONAL { BIND(COALESCE(?multiplier, 1) as ?multiplier) }
                    OPTIONAL { ?unit qudt:conversionOffset ?offset }
                    OPTIONAL { BIND(COALESCE(?offset, 0) as ?offset) }
                    BIND(((?value * ?multiplier) + ?offset) AS ?accuracy)}
                } ORDER BY DESC(?datetime) LIMIT 25
            `, {}).then(rows => {
                expect(rows.length).to.be.greaterThan(10);
                done();
            }).catch(done);
        });

        // it('should support shape trees', (done) => {
        //     const shapeTree = new ShapeTree(undefined, undefined, 'http://qudt.org/vocab/unit/');
        //     expect(urlMatchesTemplate('http://qudt.org/vocab/unit/DEG', shapeTree.uriTemplate));
        //     driver.engine.invalidateHttpCache();
        //     new QueryEngine().queryBindings(`
        //         PREFIX qudt: <http://qudt.org/schema/qudt/>
        //         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        //         SELECT ?unitName {
        //             ?unit a qudt:Unit ;
        //                     rdfs:label ?unitName .
        //         }
        //     `, {
        //         sources: ["http://qudt.org/vocab/unit/"],

        //         log: {
        //             info: (message, data) => {
        //                 console.log(message);
        //             },
        //             debug: (message, data) => {
        //              //   console.log(message);
        //             },
        //             error: (message, data) => {
        //                 console.log(message);
        //             },
        //             warn: (message, data) => {
        //                 console.log(message);
        //             },
        //             fatal: (message, data) => {
        //                 console.log(message);
        //             },
        //             trace: (message, data) => {
        //                 console.log(message);
        //             }
        //         },
        //         metadata: {
        //             shapetrees: {
        //                 applicable: [
        //                     shapeTree
        //                 ]
        //             }
        //         }
        //     }).then(stream => {
        //         stream.on('end', () => {
        //             done();
        //         });
        //     }).catch(done);
        // });
    });

});
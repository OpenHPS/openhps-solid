import { SerializableMember, SerializableObject } from "@openhps/core";
import { ogc } from "@openhps/rdf";
import { QuantityValue } from "./QuantityValue";
import { DataFactory } from 'n3';

@SerializableObject({
    rdf: {
        type: ogc.Geometry,
        serializer: (geometry: Geometry) => {
            return {
                predicates: {
                    [ogc.asWKT]: [
                        DataFactory.literal(`POINT(${geometry.longitude} ${geometry.latitude})`, DataFactory.namedNode(ogc.wktLiteral)),
                    ],
                    [ogc.coordinateDimension]: [DataFactory.literal(2)],
                    [ogc.spatialDimension]: [DataFactory.literal(2)],
                    [ogc.dimension]: [DataFactory.literal(2)],
                }
            };
        }
    }
})
export class Geometry {
    latitude: number;
    longitude: number;

    @SerializableMember({
        rdf: {
            predicate: ogc.hasSpatialAccuracy
        }
    })
    spatialAccuracy?: QuantityValue;
}

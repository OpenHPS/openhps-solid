import { QueryEngineBase } from '@comunica/actor-init-query';
import type { ActorInitQueryBase } from '@comunica/actor-init-query';
const engineDefault = require('./engine-default'); // eslint-disable-line

/**
 * A Comunica SPARQL query engine.
 */
export class QueryEngine extends QueryEngineBase {
    public constructor(engine: ActorInitQueryBase = engineDefault) {
        super(engine);
    }
}

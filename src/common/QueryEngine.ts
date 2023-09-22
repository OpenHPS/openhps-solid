import { QueryEngineBase } from '@comunica/actor-init-query';
import type { ActorInitQueryBase } from '@comunica/actor-init-query';

/**
 * A Comunica SPARQL query engine.
 */
export class QueryEngine extends QueryEngineBase {
    public constructor(engine: ActorInitQueryBase) {
        super(engine);
    }
}

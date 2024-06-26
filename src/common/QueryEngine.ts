import { QueryEngineBase } from '@comunica/actor-init-query';
import type { ActorInitQueryBase } from '@comunica/actor-init-query';
import type { IQueryContextCommon } from '@comunica/types';

/**
 * A Comunica SPARQL query engine.
 */
export class QueryEngine<
    QueryContext extends IQueryContextCommon = IQueryContextCommon,
> extends QueryEngineBase<QueryContext> {
    public constructor(engine: ActorInitQueryBase) {
        super(engine);
    }
}

import type { ActorInitQueryBase } from '@comunica/actor-init-query';

import './types';
export * from './SolidService';
export * from './SolidProfileObject';
export * from './SolidDataDriver';
export * from './SolidPropertyService';
export * from './DatasetSubscription';
export * from './SolidPropertySink';
export * from './SolidPropertySource';

export const DefaultEngine: ActorInitQueryBase = require('./engine-default')(); // eslint-disable-line

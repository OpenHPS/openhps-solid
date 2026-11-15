import type { ActorInitQueryBase } from '@comunica/actor-init-query';

/**
 * Declaration for the precompiled comunica engine emitted by `prepare:comunica`
 * (`comunica-compile-config`). The CommonJS artifact has `module.exports = <factory>`
 * and the ESM twin has `export default <factory>`.
 */
declare const engineFactory: (variables?: Record<string, unknown>) => ActorInitQueryBase;
export default engineFactory;

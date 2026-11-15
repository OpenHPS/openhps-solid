/**
 * Emit an ESM twin of the precompiled comunica engine.
 *
 * `comunica-compile-config` (componentsjs) only emits CommonJS
 * (`module.exports = function(variables) { ... }`). The ESM build needs the same
 * engine as `export default function(variables) { ... }`, so this rewrites the
 * single module-export line in place.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cjs = readFileSync(resolve(root, 'src/common/engine-default.js'), 'utf8');
writeFileSync(resolve(root, 'src/common/engine-default.mjs'), cjs.replace(/^module\.exports = /, 'export default '));

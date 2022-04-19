/**
 * Temporary fix for Solid
 *
 * @see {@link https://github.com/inrupt/solid-client-js/pull/1545}
 */
import * as fs from 'fs';
import * as path from 'path';

const directory = path.dirname(require.resolve('@inrupt/solid-client'));
const indexFiles = fs.readdirSync(directory).filter((file) => file.startsWith('index'));
indexFiles.forEach((indexFile) => {
    indexFile = path.join(directory, indexFile);
    let indexContents = fs.readFileSync(indexFile, { encoding: 'utf-8' });
    indexContents = indexContents.replace(/\.filter\(\(addition\) => !containsBlankNode\(addition\)\)/g, '');
    fs.writeFileSync(indexFile, indexContents);
    console.log(`Patched '${indexFile}'!`);
});

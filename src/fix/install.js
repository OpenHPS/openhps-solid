/**
 * Temporary fix for Solid
 *
 * @see {@link https://github.com/inrupt/solid-client-js/pull/1545}
 */

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const directory = path.dirname(require.resolve('@inrupt/solid-client'));
const indexFiles = fs.readdirSync(directory).filter((file) => file.startsWith('index'));
indexFiles.push("thing/thing.internal.mjs");
indexFiles.forEach((indexFile) => {
    indexFile = path.join(directory, indexFile);
    let indexContents = fs.readFileSync(indexFile, { encoding: 'utf-8' });
    indexContents = indexContents.replace(/\.filter\(\(addition\) => !containsBlankNode\(addition\)\)/g, '');
    fs.writeFileSync(indexFile, indexContents);
    console.log(`Patched '${indexFile}'!`);
});

/**
 * mister zip
 * Like mister pack, but without the './package/' and as a zip file.
 */
import * as path from 'path';
import { Argv } from 'yargs';

import { packCommand } from './pack';

import getMatchingLocalPackages from '../lib/package/get-matching-local-packages';
import resolveDistFileLocation from '../lib/package/resolve-dist-file-location';

export const command = 'zip [packages...]';
export const describe = 'Creates a zip file with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister zip package1 package2';
export const handler = zipCommand;

export const builder = (yargs: Argv) => yargs.option('v', {
    alias: 'verbose',
    count: true,
    description: 'Enable Verbose messaging.  Add another to see subcommand stdout.',
}).option('debug-persist-package-json', {
    default: false,
    description: 'Persists changes made to package.json as package-debug.json for debug purposes.',
    type: 'boolean',
});

export function zipCommand(argv) {
    return packCommand(argv).then(() => {
        return Promise.all(getMatchingLocalPackages(argv._).map(zipLocalPackage));
    });
}

/**
 * 1. Find the dist file name
 * 2. create read file stream
 * 3. gunzip
 * 4. untar
 * 5. for each tar entry, pipe into output zip stream.
 */
function zipLocalPackage(packageName) {
    return new Promise((resolve, reject) => {
        const tgzFile = resolveDistFileLocation(packageName);
        const zipFile = path.join(path.dirname(tgzFile), path.basename(tgzFile, '.tgz') + '.zip');
        resolve();
    });
}

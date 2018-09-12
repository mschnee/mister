/**
 * mister zip
 * Like mister pack, but without the './package/' and as a zip file.
 */
import * as path from 'path';
import { Argv } from 'yargs';

import { packCommand } from './pack';

import getPackagesForArgs from '../lib/package/get-packages-for-argv';
import resolveDistFileLocation from '../lib/package/resolve-dist-file-location';
import npmTgzToZip from '../lib/stream/npm-tgz-to-zip';

export const command = 'zip [packages...]';
export const describe = 'Creates a zip file with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister zip package1 package2';
export const handler = zipCommand;

export function zipCommand(argv) {
    return packCommand(argv).then(() => {
        return Promise.all(getPackagesForArgs(argv).map(zipLocalPackage));
    });
}

function zipLocalPackage(packageName) {
    const tgzFile = resolveDistFileLocation(packageName);
    const zipFile = path.join(path.dirname(tgzFile), path.basename(tgzFile, '.tgz') + '.zip');
    return npmTgzToZip(tgzFile, zipFile);
}

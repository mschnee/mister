import * as fs from 'fs';
import { EOL } from 'os';
import * as path from 'path';

import * as filteredGlob from 'glob-gitignore';

import getPackageDir from '../package/get-package-dir';
import cacheBuildTimestampExists from './cache-entry-exists';
import getCache from './get-cache';

import * as debug from 'debug';
const cacheDebugger = debug('mister:cache');

/**
 * Checks if the package needs a rebuild, honoring it's gitignore.
 */
export default function isPackageUpToDate(packagePrefix, packageName: string) {
    const cache = getCache();
    if (!cacheBuildTimestampExists(cache, packageName)) {
        cacheDebugger(packageName, 'has no build timestamp');
        return false;
    }

    const lastBuildTime = new Date(cache.packages[packageName].lastBuildTime);

    const PWD = process.cwd();
    const packagePath = getPackageDir(packagePrefix, packageName);
    const gitIgnoreFile = path.join(packagePath, '.gitignore');

    let ignore = [];
    if (fs.existsSync(gitIgnoreFile)) {
        ignore = fs.readFileSync(gitIgnoreFile, 'utf8').split(EOL);
    }

    const filesToCheck: string[] = filteredGlob.sync('**', {
        cwd: packagePath,
        ignore,
    });

    return !filesToCheck.some((f) => {
        const stat = fs.statSync(path.join(packagePath, f));
        if (stat.isDirectory()) {
            return false;
        }
        if (stat.mtime >= lastBuildTime) {
            cacheDebugger(f, 'is out of date', stat.mtime, lastBuildTime);
            return true;
        } else {
            return false;
        }
    });
}

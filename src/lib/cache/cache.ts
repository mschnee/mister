import * as fs from 'fs';
import * as path from 'path';

import * as nodeGlob from 'glob';
import * as filteredGlob from 'glob-gitignore';

import getCache from '../get-cache';

// The legit CWD
const OCWD = process.cwd();

// This may eventually be configurable.
const PACKAGE_DIR = 'packages/node_modules';

// This will be the packages on disk.
let localPackages: string[];

export function getLocalPackages() {
    // CWD needs to be scoped because mister frequently changes directories.
    const PWD = process.cwd();
    if (!localPackages) {
        const pdir = path.join(PWD, PACKAGE_DIR);
        const tlPackages = nodeGlob
            .sync('*', {cwd: pdir})
            .filter((m: string) => m.substring(0, 1) !== '@');

        const scopedPackages = nodeGlob.sync('@*/*', {cwd: pdir});

        localPackages = [].concat(tlPackages, scopedPackages);
    }

    return localPackages;
}

export function arePackageDependenciesUpToDate(packageName: string) {
    return false;
}

/**
 * Checks if the package needs a rebuild, honoring it's gitignore.
 */
export function isPackageUpToDate(packageName: string) {
    const cache = getCache();
    if (
        !cache.hasOwnProperty('packages')
        || !cache.packages.hasOwnProperty(packageName)
        || !cache.packages[packageName].hasOwnProperty('lastBuildTime')
    ) {
        return false;
    }

    const lastBuildTime = new Date(cache.packages[packageName].lastBuildTime);

    const PWD = process.cwd();
    const packagePath = path.join(PWD, PACKAGE_DIR, packageName);
    const gitIgnoreFile = path.join(packagePath, '.gitignore');

    let ignore = [];
    if (fs.existsSync(gitIgnoreFile)) {
        ignore = fs.readFileSync(gitIgnoreFile, 'utf8').split('\n');
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
            // console.log(f, 'is out of date', stat.mtime, lastBuildTime);
            return true;
        } else {
            return false;
        }
    });
}

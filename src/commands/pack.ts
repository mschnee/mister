import * as path from 'path';

import { Argv } from 'yargs';

import { sync as rimraf } from 'rimraf';

import getDependencyGraph from '../lib/dependencies/get-dependency-graph';
import getPackagePjson, { restorePackagePjson } from '../lib/package/get-package-pjson';

import moveFile from '../lib/move-file';
import getPackageDir from '../lib/package/get-package-dir';
import getPackageDistFileName from '../lib/package/get-package-dist-filename';
import getPackagesForArgs from '../lib/package/get-packages-for-argv';
import getUpdatedPjsonForDist from '../lib/package/get-updated-pjson-for-dist';
import resolveDistFileLocation from '../lib/package/resolve-dist-file-location';
import runPackageProcess from '../lib/package/run-package-process';
import writePackagePjson from '../lib/package/write-package-pjson';

export const command = 'pack [packages...]';
export const describe = 'Creates npm packages with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister pack package1 package2';
export const handler = packCommand;

/**
 * for each package
 * - Get the correct dependencies
 * - remove node_modules
 * - npm i --production
 * - npm package
 * - move
 * @param argv F
 */
export function packCommand(argv) {
    const packageOrder = getDependencyGraph(getPackagesForArgs(argv)).overallOrder();

    return packageOrder.reduce((accum, packageName) => {
        return accum.then( () => {
            const newPjson = getUpdatedPjsonForDist(packageName);
            writePackagePjson(packageName, newPjson);
            rimraf(path.join(getPackageDir(packageName), 'node_modules'));
        })
        .then(() => runPackageProcess(argv, packageName, 'npm', ['install', '--production']))
        .then(() => runPackageProcess(argv, packageName, 'npm', ['pack']))
        .then(() => moveFile(
            path.join(getPackageDir(packageName), getPackageDistFileName(packageName)),
            resolveDistFileLocation(packageName),
        ))
        .then(() => restorePackagePjson(packageName))
        .catch((e) => {
            restorePackagePjson(packageName);
            throw e;
        });
    }, Promise.resolve());
}

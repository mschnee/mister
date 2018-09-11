import * as path from 'path';

import { Argv } from 'yargs';

import chalk from 'chalk';
import { sync as rimraf } from 'rimraf';

import getDependencyGraph from '../lib/dependencies/get-dependency-graph';
import getPackagePjson, { restorePackagePjson } from '../lib/package/get-package-pjson';

import moveFile from '../lib/move-file';
import getMatchingLocalPackages from '../lib/package/get-matching-local-packages';
import getMonorepoPjson from '../lib/package/get-monorepo-pjson';
import getPackageDir from '../lib/package/get-package-dir';
import getPackageDistFileName from '../lib/package/get-package-dist-filename';
import getPackagesForArgs from '../lib/package/get-packages-for-argv';
import getUpdatedPjsonForDist from '../lib/package/get-updated-pjson-for-dist';
import resolveDistFileLocation from '../lib/package/resolve-dist-file-location';
import runPackageProcess from '../lib/package/run-package-process';
import verifyPackageName from '../lib/package/verify-package-name';
import writePackagePjson from '../lib/package/write-package-pjson';

import wrap from '../lib/output/wrap';

export const command = 'pack [packages...]';
export const describe = 'Creates npm packages with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister pack package1 package2';
export const handler = packCommand;

export const builder = (yargs: Argv) => yargs.option('debug-persist-package-json', {
    default: false,
    description: 'Persists changes made to package.json as package-debug.json for debug purposes.',
    type: 'boolean',
});

/**
 * for each package
 * - Get the correct dependencies
 * - remove node_modules
 * - npm i --production
 * - npm package
 * - move
 * @param argv
 */
export function packCommand(argv) {
    const mrjson = getMonorepoPjson();
    const manifestFile = {
        packages: {},
        version:  mrjson.version,
    };
    const packageOrder = getDependencyGraph(argv['package-prefix'], getPackagesForArgs(argv)).overallOrder();
    return packageOrder.reduce((accum, packageName) => {
        return accum.then(() => verifyPackageName(argv['package-prefix'], packageName)).then( () => {
            const newPjson = getUpdatedPjsonForDist(argv['package-prefix'], packageName);
            writePackagePjson(argv, packageName, newPjson);
            rimraf(path.join(getPackageDir(argv['package-prefix'], packageName), 'node_modules'));
        })
        .then(() => {
            if (argv.v >= 1) {
                /* tslint:disable-next-line */
                console.log(wrap('[]', 'mister pack'), packageName);
            }
        })
        .then(() => runPackageProcess(argv, packageName, 'npm', ['install', '--production']))
        .then(() => runPackageProcess(argv, packageName, 'npm', ['pack']))
        .then(() => {
            manifestFile.packages[packageName] = {
                tgzFileName: getPackageDistFileName(packageName),
                tgzFilePath: resolveDistFileLocation(packageName),
            };
            return  moveFile(
                argv,
                path.join(getPackageDir(argv['package-prefix'], packageName), getPackageDistFileName(packageName)),
                resolveDistFileLocation(packageName),
            );
        })
        .then(() => {
            if (argv.v >= 1) {
                /* tslint:disable-next-line */
                console.log(wrap('[]', 'mister pack'), 'created', chalk.bold.green(resolveDistFileLocation(packageName)));
            }
        })
        .then(() => restorePackagePjson(argv, packageName))
        .then(() => rimraf(path.join(getPackageDir(argv['package-prefix'], packageName), 'node_modules')))
        .catch((e: Error) => {
            /* tslint:disable-next-line */
            console.error(wrap('[]', 'mister pack', chalk.bold.red), e.message)
            restorePackagePjson(argv, packageName);
            throw e;
        });
    }, Promise.resolve()).then(() => manifestFile);
}

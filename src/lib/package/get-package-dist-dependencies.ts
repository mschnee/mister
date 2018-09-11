import * as path from 'path';

import getLocalPackages from './get-local-packages';
import getMonorepoPjson from './get-monorepo-pjson';
import getPackageDir from './get-package-dir';
import getPackagePjson from './get-package-pjson';
import resolveDistfileLocation from './resolve-dist-file-location';

/**
 * Gets the actual dependencies to be `npm i -p`
 * These should be bundledDependencies and they should have corresponding versions
 * from the monorepo package.json file.
 * @param packageName
 */
export default function getPackageDistDependencies(packagePrefix, packageName: string) {
    const localPackages = getLocalPackages(packagePrefix);
    const pjson = getPackagePjson(packagePrefix, packageName);
    const mrjson = getMonorepoPjson();

    const pnames = (pjson.bundledDependencies || []).concat(pjson.bundleDependencies || []);
    return pnames.reduce((accum, depName) => {
        // if we need to bundle a local dependency, we need the absolute path to it's it's tarball.
        if (localPackages.indexOf(depName) >= 0) {
            accum[depName] =  path.relative(getPackageDir(packagePrefix, packageName), resolveDistfileLocation(depName));
        } else if (!mrjson.dependencies.hasOwnProperty(depName)) {
            throw new Error(`Monorepo package.json is missing '${depName}' from dependencies, requested by package '${packageName}'`);
        } else {
            accum[depName] = mrjson.dependencies[depName];
        }

        return accum;
    }, {});
}

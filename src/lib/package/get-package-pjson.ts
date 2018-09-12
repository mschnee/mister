import * as fs from 'fs';
import * as path from 'path';

import moveFile from '../move-file';
import getPackageDir from './get-package-dir';

interface PackageJsonCache {
    [key: string]: Buffer;
}

const pjsonCache: PackageJsonCache = {};
export default function getPackagePjson(packagePrefix, packageName: string) {
    if (!pjsonCache.hasOwnProperty(packageName)) {
        const p = path.join(getPackageDir(packagePrefix, packageName), 'package.json');
        if (!fs.existsSync(p)) {
            throw new Error(`Package ${packageName} does not have a package.json file`);
        }
        pjsonCache[packageName] = fs.readFileSync(p);
    }

    try {
        return JSON.parse(pjsonCache[packageName].toString());
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.error('Error parsing package.json for', packageName);
        throw e;
    }
}

export function restorePackagePjson(argv, packageName: string) {
    /* istanbul ignore else */
    if (pjsonCache.hasOwnProperty(packageName)) {
        const p = path.join(getPackageDir(argv['package-prefix'], packageName), 'package.json');
        /* istanbul ignore if */
        if (argv['debug-persist-package-json']) {
            return moveFile(argv, p, path.join(getPackageDir(argv['package-prefix'], packageName), 'package-debug.json')).then(() => {
                fs.writeFileSync(p, pjsonCache[packageName]);
            });
        } else {
            fs.writeFileSync(p, pjsonCache[packageName]);
        }
    }
}

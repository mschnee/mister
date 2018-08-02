import * as fs from 'fs';
import * as path from 'path';

import { TEST_NO_CACHE } from '../environment';
import getPackageDir from './get-package-dir';

interface PackageJsonCache {
    [key: string]: Buffer;
}

const pjsonCache: PackageJsonCache = {};
export default function getPackagePjson(packageName: string) {
    if (TEST_NO_CACHE || !pjsonCache.hasOwnProperty(packageName)) {
        const p = path.join(getPackageDir(packageName), 'package.json');
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

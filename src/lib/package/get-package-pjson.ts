import * as fs from 'fs';
import * as path from 'path';

import getPackageDir from './get-package-dir';

interface PackageJsonCache {
    [key: string]: Buffer;
}

const pjsonCache: PackageJsonCache = {};
export default function getPackagePjson(packageName: string) {
    if (!pjsonCache.hasOwnProperty(packageName)) {
        const p = path.join(getPackageDir(packageName), 'package.json');
        if (!fs.existsSync(p)) {
            throw new Error(`Package ${packageName} does not have a package.json file`);
        }
        pjsonCache[packageName] = fs.readFileSync(p);
    }

    return JSON.parse(pjsonCache[packageName].toString());
}

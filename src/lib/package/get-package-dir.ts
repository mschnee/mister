import * as path from 'path';

import { TEST_NO_CACHE } from '../environment';

const pdirCache = {};

export default function getPackageDir(packageName: string) {
    if (TEST_NO_CACHE || !pdirCache.hasOwnProperty(packageName)) {
        const PACKAGE_DIR = 'packages/node_modules';
        const PWD = process.cwd();
        pdirCache[packageName] = path.join(PWD, PACKAGE_DIR, packageName);
    }
    return pdirCache[packageName];
}

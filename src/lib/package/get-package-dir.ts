import * as path from 'path';

const pdirCache = {};

export default function getPackageDir(packageName: string) {
    if (!pdirCache.hasOwnProperty(packageName)) {
        const PACKAGE_DIR = 'packages/node_modules';
        const PWD = process.cwd();
        pdirCache[packageName] = path.join(PWD, PACKAGE_DIR, packageName);
    }
    return pdirCache[packageName];
}

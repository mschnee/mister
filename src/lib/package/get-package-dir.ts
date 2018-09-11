import * as path from 'path';

const pdirCache = {};

export default function getPackageDir(packagePrefix, packageName: string) {
    if (!packageName) {
        throw new Error('missing arguments');
    }
    if (!pdirCache.hasOwnProperty(packageName)) {
        const PWD = process.cwd();
        pdirCache[packageName] = path.resolve(PWD, packagePrefix || 'packages', 'node_modules', packageName);
    }
    return pdirCache[packageName];
}

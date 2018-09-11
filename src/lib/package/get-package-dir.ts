import * as path from 'path';
import yargs from 'yargs';
const argv = yargs.argv;

const pdirCache = {};

export default function getPackageDir(packageName: string) {
    if (!pdirCache.hasOwnProperty(packageName)) {
        const PWD = process.cwd();
        pdirCache[packageName] = path.resolve(PWD, (argv && argv['package-prefix']) || 'packages', 'node_modules', packageName);
    }
    return pdirCache[packageName];
}

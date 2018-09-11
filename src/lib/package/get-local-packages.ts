import * as path from 'path';

import * as nodeGlob from 'glob';
import yargs from 'yargs';
const argv = yargs.argv;

// This will be the packages on disk.
let localPackages: string[];
export default function getLocalPackages() {
    // CWD needs to be scoped because mister frequently changes directories.
    const PWD = process.cwd();
    if (!localPackages) {
        const pdir = path.resolve(PWD, (argv && argv['package-prefix']) || 'packages', 'node_modules');
        const tlPackages = nodeGlob
            .sync('*', {cwd: pdir})
            .filter((m: string) => m.substring(0, 1) !== '@');

        const scopedPackages = nodeGlob.sync('@*/*', {cwd: pdir});

        localPackages = [].concat(tlPackages, scopedPackages);
    }

    return localPackages;
}

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';


// This may eventually be configurable.
const PACKAGE_DIR = 'packages/node_modules';

// This will be the packages on disk.
let localPackages: string[];

export function getLocalPackages() {
    // CWD needs to be scoped because mister frequently changes directories.
    const CWD = process.cwd();
    if (!localPackages) {
        const pdir = path.join(CWD, PACKAGE_DIR)
        const tlPackages = glob
            .sync('*', {cwd: pdir})
            .filter((m: string) => m.substring(0, 1) !== '@');

        const scopedPackages = glob.sync('@*/*', {cwd: pdir});

        localPackages = [].concat(tlPackages, scopedPackages);
    }

    return localPackages;
}

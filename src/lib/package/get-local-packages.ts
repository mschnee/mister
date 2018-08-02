import * as path from 'path';

import * as nodeGlob from 'glob';

// This may eventually be configurable.
import { PACKAGE_DIR, TEST_NO_CACHE } from '../environment';

// This will be the packages on disk.
let localPackages: string[];
export default function getLocalPackages() {
    // CWD needs to be scoped because mister frequently changes directories.
    const PWD = process.cwd();
    if (TEST_NO_CACHE || !localPackages) {
        const pdir = path.join(PWD, PACKAGE_DIR);
        const tlPackages = nodeGlob
            .sync('*', {cwd: pdir})
            .filter((m: string) => m.substring(0, 1) !== '@');

        const scopedPackages = nodeGlob.sync('@*/*', {cwd: pdir});

        localPackages = [].concat(tlPackages, scopedPackages);
    }

    return localPackages;
}

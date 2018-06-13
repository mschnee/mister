import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const CWD = process.cwd();

export default class MisterCache {
    packageDir = 'packages/node_modules';

    localPackages: string[];

    constructor() {

    }

    /**
     * These are the local package folders on disk.
     */
    getLocalPackages() {
        if (!this.localPackages) {
            const pdir = path.join(CWD, this.packageDir)

            const tlPackages = glob
                .sync('*/', {cwd: pdir})
                .filter((m: string) => m.substring(0, 1) !== '@');

            const scopedPackages = glob.sync('@*/*', {cwd: pdir});

            this.localPackages = [].concat(tlPackages, scopedPackages);
        }

        return this.localPackages;
    }
}
import { SpawnOptions } from 'child_process';
import * as path from 'path';

import getPackageDir from './get-package-dir';
import runProcess from './run-process';

export default function doTask(argv: any, taskName: string, packageName: string) {
    const packageDir = getPackageDir(packageName);
    const spawnOptions: SpawnOptions = {
        cwd: packageDir,
        env: Object.assign({}, process.env),
    };

    const localBin = path.join(process.cwd(), 'node_modules', '.bin');
    if (process.env.hasOwnProperty('PATH')) {
        spawnOptions.env.PATH = `${process.env.PATH}${path.delimiter}${localBin}`;
    }
    if (process.env.hasOwnProperty('Path')) {
        spawnOptions.env.Path = `${process.env.Path}${path.delimiter}${localBin}`;
    }

    if (argv.stdio) {
        spawnOptions.stdio = 'inherit';
    }

    return runProcess('npm', ['run', taskName], spawnOptions, !!argv.verbose);
}
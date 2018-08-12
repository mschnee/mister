import { SpawnOptions } from 'child_process';
import * as path from 'path';

import runProcess from '../run-process';
import getPackageDir from './get-package-dir';

export default function runPackageProcess(argv: any, packageName: string, command: string, args: string[]) {
    const packageDir = getPackageDir(packageName);
    const spawnOptions: SpawnOptions = {
        cwd: packageDir,
        env: Object.assign({}, process.env),
    };

    const localBin = path.join(process.cwd(), 'node_modules', '.bin');
    if (process.env.hasOwnProperty('PATH')) {
        spawnOptions.env.PATH = `${process.env.PATH}${path.delimiter}${localBin}`;
    }

    // This sometimes happens on Windows:
    if (process.env.hasOwnProperty('Path')) {
        spawnOptions.env.Path = `${process.env.Path}${path.delimiter}${localBin}`;
    }

    return runProcess(command, args, spawnOptions, argv);
}

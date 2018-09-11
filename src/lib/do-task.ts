import { SpawnOptions } from 'child_process';
import * as path from 'path';

import chalk from 'chalk';

import getPackageDir from './package/get-package-dir';
import runProcess from './run-process';

import wrap from './output/wrap';

export default function doTask(argv: any, taskName: string, packageName: string) {
    const packageDir = getPackageDir(argv['package-prefix'], packageName);
    const spawnOptions: SpawnOptions = {
        cwd: packageDir,
        env: Object.assign({}, process.env),
    };

    const localBin = path.join(process.cwd(), 'node_modules', '.bin');
    /* istanbul ignore next */
    if (process.env.hasOwnProperty('PATH')) {
        spawnOptions.env.PATH = `${process.env.PATH}${path.delimiter}${localBin}`;
    }

    // This sometimes happens on Windows:
    /* istanbul ignore next */
    if (process.env.hasOwnProperty('Path')) {
        spawnOptions.env.Path = `${process.env.Path}${path.delimiter}${localBin}`;
    }

    if (argv.verbose >= 2) {
        /* tslint:disable-next-line */
        console.log(wrap('[]', 'do-task', chalk.yellow), 'running', chalk.bold(taskName), 'on', chalk.bold(packageName));
    }
    return runProcess('npm', ['run', taskName], spawnOptions, argv);
}

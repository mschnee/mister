import { SpawnOptions } from 'child_process';
import getPackageDir from './get-package-dir';
import runProcess from './run-process';

export default function doTask(argv: any, taskName: string, packageName: string) {
    const packageDir = getPackageDir(packageName);
    const spawnOptions: SpawnOptions = {
        cwd: packageDir,
    };

    if (argv.stdio) {
        spawnOptions.stdio = 'inherit';
    }

    return runProcess('npm', ['run', taskName], spawnOptions, !!argv.verbose);
}

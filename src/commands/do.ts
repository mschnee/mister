import { Argv } from 'yargs';

import doTask from '../lib/do-task';
import getMatchingLocalPackages from '../lib/package/get-matching-local-packages';
import getMatchingPackageTasks from '../lib/package/get-matching-package-tasks';

export const command = 'do [packages...]';
export const describe = 'Runs npm tasks on packages';
export const usage = 'mister do package1 package2 --tasks=clean test build';
export const handler = doCommand;

export const builder = (yargs: Argv) => yargs.option('v', {
    alias: 'verbose',
    count: true,
    description: 'Enable Verbose messaging.  Add another to see subcommand stdout.',
}).option('t', {
    alias: ['task', 'tasks'],
    default: ['build'],
    type: 'array',
}).help();

export function doCommand(argv) {
    return getMatchingLocalPackages(argv.packages).reduce((accum, packageName) => {
        // no-op
        return getMatchingPackageTasks(packageName, argv.tasks).reduce((a, task) => {
            a.then( () => doTask(argv, task, packageName));
            return a;
        }, accum);
    }, Promise.resolve());
}

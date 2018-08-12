import { Argv } from 'yargs';

import getDependencyGraph from '../lib/dependencies/get-dependency-graph';
import doTaskOnReducer from '../lib/do-tasks-reducer';
import getPackagesForArgs from '../lib/package/get-packages-for-argv';

export const command = 'do [packages...]';
export const describe = 'Runs npm tasks on packages';
export const usage = 'mister do package1 package2 --tasks=clean test build';
export const handler = doCommand;

export const builder = (yargs: Argv) => yargs.option('v', {
    alias: 'verbose',
    count: true,
    description: 'Enable Verbose messaging.  Add another to see subcommand stdout.',
}).option('all', {
    default: false,
    description: 'Run tasks on all packages',
    type: 'boolean',
}).option('tasks', {
    alias: ['task', 't'],
    default: ['build'],
    type: 'array',
}).option('with-dependencies', {
    alias: ['d'],
    default: false,
    type: 'boolean',
}).help();

export function doCommand(argv) {
    if (argv['with-dependencies']) {
        return doCommandWithDependencies(argv);
    } else {
        return doCommandWithoutDependencies(argv);
    }
}

export function doCommandWithoutDependencies(argv) {
    const reduceFn = doTaskOnReducer.bind(this, argv);
    return getPackagesForArgs(argv)
        .reduce(reduceFn, Promise.resolve());
}

export function doCommandWithDependencies(argv) {
    const reduceFn = doTaskOnReducer.bind(this, argv);
    const packageOrder = getDependencyGraph(getPackagesForArgs(argv)).overallOrder();

    return packageOrder.reduce(reduceFn, Promise.resolve());
}

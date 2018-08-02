import { Argv } from 'yargs';

import getFullDependencyGraph from '../lib/dependencies/get-full-dependency-graph';
import doTaskOnReducer from '../lib/do-task-reducer';
import getLocalPackages from '../lib/package/get-local-packages';

export const command = 'do-all [tasks...]';
export const describe = 'Runs npm tasks on all packages';
export const usage = 'mister do-all clean test build';
export const handler = doAllCommand;

export const builder = (yargs: Argv) => yargs.option('v', {
    alias: 'verbose',
    count: true,
    description: 'Enable Verbose messaging.  Add another to see subcommand stdout.',
}).option('with-dependencies', {
    alias: ['d'],
    default: false,
    type: 'boolean',
}).help();

export function doAllCommand(argv) {
    if (argv['with-dependencies']) {
        return doCommandWithDependencies(argv);
    } else {
        return doCommandWithoutDependencies(argv);
    }
}

export function doCommandWithoutDependencies(argv) {
    const reduceFn = doTaskOnReducer.bind(this, argv);
    return getLocalPackages()
        .reduce(reduceFn, Promise.resolve());
}

export function doCommandWithDependencies(argv) {
    const reduceFn = doTaskOnReducer.bind(this, argv);
    return getFullDependencyGraph()
        .overallOrder()
        .reduce(reduceFn, Promise.resolve());
}

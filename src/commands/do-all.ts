import { Argv } from 'yargs';

import getFullDependencyGraph from '../lib/dependencies/get-full-dependency-graph';
import doTaskOnReducer from '../lib/do-tasks-reducer';

export const command = 'do-all [tasks...]';
export const describe = 'Runs npm tasks on all packages';
export const usage = 'mister do-all clean test build';
export const handler = doAllCommand;

export const builder = (yargs: Argv) => yargs.option('v', {
    alias: 'verbose',
    count: true,
    description: 'Enable Verbose messaging.  Add another to see subcommand stdout.',
}).help();

export function doAllCommand(argv) {
    const reduceFn = doTaskOnReducer.bind(this, argv);
    return getFullDependencyGraph()
        .overallOrder()
        .reduce(reduceFn, Promise.resolve());
}

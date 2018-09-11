import { Argv } from 'yargs';

import getFullDependencyGraph from '../lib/dependencies/get-full-dependency-graph';
import doTaskOnReducer from '../lib/do-tasks-reducer';

export const command = 'do-all [tasks...]';
export const describe = 'Runs npm tasks on all packages';
export const usage = 'mister do-all clean test build';
export const handler = doAllCommand;

export function doAllCommand(argv) {
    const reduceFn = doTaskOnReducer.bind(this, argv);
    return getFullDependencyGraph(argv['package-prefix'])
        .overallOrder()
        .reduce(reduceFn, Promise.resolve());
}

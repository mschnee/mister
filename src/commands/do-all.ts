import { Argv } from 'yargs';

import getDependencyGraph from '../lib/dependencies/get-dependency-graph';
import doTask from '../lib/do-task';
import getLocalPackages from '../lib/package/get-local-packages';
import getMatchingLocalPackages from '../lib/package/get-matching-local-packages';
import getMatchingPackageTasks from '../lib/package/get-matching-package-tasks';

export const command = 'do-all [tasks...]';
export const describe = 'Runs npm tasks on all';
export const usage = 'mister do-all clean test build';
export const handler = doCommand;

export const builder = (yargs: Argv) => yargs.option('v', {
    alias: 'verbose',
    count: true,
    description: 'Enable Verbose messaging.  Add another to see subcommand stdout.',
}).option('with-dependencies', {
    alias: ['d'],
    default: false,
    type: 'boolean',
}).help();

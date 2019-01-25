import { Argv } from 'yargs';

import App from '../lib/App';

export const command = 'do [packages...]';
export const describe = 'Runs npm tasks on packages.  Negate a task name to skip checking for previous invocations of that task';
/* istanbul ignore file */
export const usage = 'mister do package1 package2 --tasks=clean !test build';

export const builder = (yargs: Argv) => yargs.option('all', {
    default: false,
    description: 'Run tasks on all packages',
    type: 'boolean',
}).option('tasks', {
    alias: ['task', 't'],
    default: ['build'],
    type: 'array',
}).option('dependencies', {
    alias: ['d'],
    default: true,
    type: 'true',
}).help();

export async function handler(argv) {
    const app = new App(argv);
    const result = await app.doCommand();
    if (!result) {
        process.exit(-1);
    }
}

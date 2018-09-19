import { Argv } from 'yargs';

import App from '../lib/App';

export const command = 'do [packages...]';
export const describe = 'Runs npm tasks on packages';
export const usage = 'mister do package1 package2 --tasks=clean test build';

export const builder = (yargs: Argv) => yargs.option('all', {
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

export function handler(argv) {
    const app = new App(argv);
    return app.doCommand();
}

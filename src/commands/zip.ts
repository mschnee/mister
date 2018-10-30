/* istanbul ignore file */
import { Argv } from 'yargs';

import App from '../lib/App';

export const command = 'zip [packages...]';
export const describe = 'Creates a zip file with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister zip package1 package2';

export const builder = (yargs: Argv) => yargs.option('package-version', {
    default: false,
    description: 'Includes the version with the zip file',
    type: 'boolean',
});

export function handler(argv) {
    const app = new App(argv);
    return app.zipCommand();
}

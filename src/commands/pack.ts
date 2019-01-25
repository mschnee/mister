/* istanbul ignore file */
import { Argv } from 'yargs';

import App from '../lib/App';

export const command = 'pack [packages...]';
export const describe = 'Creates npm packages with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister pack package1 package2';

export const builder = (yargs: Argv) => yargs.option('debug-persist-package-json', {
    default: false,
    description: 'Persists changes made to package.json as package-debug.json for debug purposes.',
    type: 'boolean',
});

export async function handler(argv) {
    const app = new App(argv);
    const result = await app.packCommand();
    if (!result) {
        process.exit(-1);
    }
}

/* istanbul ignore file */
import App from '../lib/App';

export const command = 'zip [packages...]';
export const describe = 'Creates a zip file with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister zip package1 package2';

export async function handler(argv) {
    const app = new App(argv);
    const result = await app.zipCommand();
    if (!result) {
        process.exit(-1)
    }
}

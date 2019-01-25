/* istanbul ignore file */
import App from '../lib/App';

export const command = 'clean';
export const describe = 'Cleans the cache out.';
export const usage = 'mister clean';

export async function handler(argv) {
    const app = new App(argv);
    const result = await app.cleanCommand();
    if (!result) {
        return process.exit(-1);
    }
}

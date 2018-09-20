/* istanbul ignore file */
import App from '../lib/App';

export const command = 'clean';
export const describe = 'Cleans the cache out.';
export const usage = 'mister clean';

export function handler(argv) {
    const app = new App(argv);
    return app.cleanCommand();
}

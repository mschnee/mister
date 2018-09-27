/* istanbul ignore file */
import App from '../lib/App';

export const command = 'do-all [tasks...]';
export const describe = 'Runs npm tasks on all packages.  Negate a task name to skip checking for previous invocations.';
export const usage = 'mister do-all !clean !test build';

export function handler(argv) {
    const app = new App(argv);
    return app.doCommandOnAll();
}

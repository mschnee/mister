import App from '../lib/App';

export const command = 'do-all [tasks...]';
export const describe = 'Runs npm tasks on all packages';
export const usage = 'mister do-all clean test build';

export function handler(argv) {
    const app = new App(argv);
    return app.doCommandOnAll();
}

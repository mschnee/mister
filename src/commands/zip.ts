import App from '../lib/App';

export const command = 'zip [packages...]';
export const describe = 'Creates a zip file with bundledDependencies.  Does not check if they are built first.';
export const usage = 'mister zip package1 package2';

export function handler(argv) {
    const app = new App(argv);
    return app.zipCommand();
}

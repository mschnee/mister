/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as path from 'path';

import App from '../../../lib/App';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');
const TDIR = path.join(CWD);


test.before(() => {
    process.chdir(TDIR);
});

test.after(() => {
    process.chdir(OCWD);
});

test('command: do - should error', (t) => {
    const argv = {
        packages: ['package1', '@test/package3'],
        quiet: true,
        stdio: false,
        tasks: ['!fails1', '!test2'],
    };

    const app = new App(argv, {writeCache: false});

    return app.doCommand().then((r) => {
        t.is(r, false)
    }).catch(e => {
        t.not(e, 0);
    })
});

/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as path from 'path';
import * as sinon from 'sinon';

import App from '../../../lib/App';

import { handler } from '../../do';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');
const TDIR = path.join(CWD);

test.before(() => {
    process.chdir(TDIR);
});

test.after(() => {
    process.chdir(OCWD);
});

test('command: do --dependencies', (t) => {
    const argv = {
        'dependencies': true,
        'packages': ['@test/package4'],
        'quiet': true,
        'tasks': ['!test3'],
    };
    const app = new App(argv, {writeCache: false});
    const spy = sinon.spy(app, 'doTask');

    return app.doCommand().then(() => {
        t.is(spy.called, true);
        t.is(spy.calledWith('package2', 'test3'), true);
        t.is(spy.calledWith('@test/package3', 'test3'), true);
        t.is(spy.calledWith('@test/package4', 'test3'), true);
    });
});

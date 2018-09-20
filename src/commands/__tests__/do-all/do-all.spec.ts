/* tslint:disable: no-unused-expression */

import test from 'ava';

import * as path from 'path';
import * as sinon from 'sinon';

import { handler } from '../../do-all';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');
const TDIR = path.join(CWD);

test.before(() => {
    process.chdir(TDIR);
});

test.after(() => {
    process.chdir(OCWD);
});

import App from '../../../lib/App';

test('command: do-all - runs three commands' , (t) => {
    const argv = {
        tasks: ['test1', 'test2', 'test3'],
    };
    const app = new App(argv, {writeCache: false});
    const spy = sinon.spy(app, 'doTask');
    return app.doCommandOnAll().then(() => {
        return Promise.all([
            t.is(spy.called, true),
            t.is(spy.calledWith('package1', 'test1'), true),
            t.is(spy.calledWith('package1', 'test3'), true),
            t.is(spy.calledWith('package2', 'test3'), true),
            t.is(spy.calledWith('@test/package3', 'test2'), true),
            t.is(spy.calledWith('@test/package3', 'test3'), true),
            t.is(spy.calledWith('@test/package4', 'test3'), true),
        ]).then(() => {
            spy.restore();
        });
    });
});

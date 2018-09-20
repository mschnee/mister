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

test('command: do - runs two commands on two packages' , async (t) => {
    const argv = {
        packages: ['package1', '@test/package3'],
        tasks: ['test1', 'test2']
    };
    const app = new App(argv, {writeCache: false});
    const spy = sinon.spy(app, 'doTask');

    return app.doCommand().then(() => {
        t.truthy(spy.called);
        t.truthy(spy.calledWith('package1', 'test1'));
        t.truthy(spy.calledWith('@test/package3', 'test2'));
    });
});

test('command: do - runs two commands given four packages but only two matching tasks' , async (t) => {
    const argv = {
        packages: ['package1', 'package2', '@test/package3', '@test/package4'],
        tasks: ['test1', 'test2']
    };
    const app = new App(argv, {writeCache: false});
    const spy = sinon.spy(app, 'doTask');

    return app.doCommand().then(() => {
        t.truthy(spy.called);
        t.truthy(spy.calledWith('package1', 'test1'));
        t.truthy(spy.calledWith('@test/package3', 'test2'));
    });
});

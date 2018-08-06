/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as path from 'path';
import * as sinon from 'sinon';

import * as doTask from '../../../lib/do-task';
import { doCommand } from '../../do';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');
const TDIR = path.join(CWD);

const spy = sinon.spy(doTask, 'default');

test.before(() => {
    process.chdir(TDIR);
});

test.after(() => {
    process.chdir(OCWD);
});

test.beforeEach(() => {
    spy.resetHistory();
});

test('command: do - should error' , async (t) => {
    const argv = {
        packages: ['package1', '@test/package3'],
        tasks: ['fails1', 'test2'],
        stdio: false,
    };
    return doCommand(argv).catch(e => {
        t.is(e, 255);
    });
});

/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as path from 'path';
import * as sinon from 'sinon';

import * as doTask from '../../../lib/do-task';
import { doCommand } from '../../do';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');
const TDIR = path.join(CWD);

test.before(() => {
    process.chdir(TDIR);
});

test.after(() => {
    process.chdir(OCWD);
});

test('command: do --with-dependencies', (t) => {
    const spy = sinon.spy(doTask, 'default');
    const argv = {
        'packages': ['@test/package4'],
        'tasks': ['test3'],
        'with-dependencies': true,
    };
    return doCommand(argv).then(() => {
        return Promise.all([
            t.is(spy.called, true),
            t.is(spy.calledWith(argv, 'test3', 'package2'), true),
            t.is(spy.calledWith(argv, 'test3', '@test/package3'), true),
            t.is(spy.calledWith(argv, 'test3', '@test/package4'), true),
        ]).then(() => {
            spy.restore();
        });
    });
});

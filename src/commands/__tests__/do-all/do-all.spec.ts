/* tslint:disable: no-unused-expression */

import test from 'ava';

import * as path from 'path';
import * as sinon from 'sinon';

import * as doTask from '../../../lib/do-task';
import { doAllCommand } from '../../do-all';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');
const TDIR = path.join(CWD);

test.before(() => {
    process.chdir(TDIR);
});

test.after(() => {
    process.chdir(OCWD);
});

test('command: do-all - runs two commands' , (t) => {
    const spy = sinon.spy(doTask, 'default');
    const argv = {
        tasks: ['test1', 'test2', 'test3'],
    };
    return doAllCommand(argv).then(() => {
        return Promise.all([
            t.is(spy.called, true),
            t.is(spy.calledWith(argv, 'test1', 'package1'), true),
            t.is(spy.calledWith(argv, 'test3', 'package1'), true),
            t.is(spy.calledWith(argv, 'test3', 'package2'), true),
            t.is(spy.calledWith(argv, 'test2', '@test/package3'), true),
            t.is(spy.calledWith(argv, 'test3', '@test/package3'), true),
            t.is(spy.calledWith(argv, 'test3', '@test/package4'), true),
        ]).then(() => {
            spy.restore();
        });
    });
});

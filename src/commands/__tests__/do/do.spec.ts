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

test('command: do - runs two commands on two packages' , (t) => {
    const spy = sinon.spy(doTask, 'default');
    const argv = {
        packages: ['package1', '@test/package3'],
        tasks: ['test1', 'test2'],
    };
    return doCommand(argv).then(() => {
        return Promise.all([
            t.is(spy.called, true),
            t.is(spy.calledWith(argv, 'test1', 'package1'), true),
            t.is(spy.calledWith(argv, 'test2', '@test/package3'), true),
        ]).then(() => {
            spy.restore();
        });
    });
});

test('command: do - runs two commands given four packages but only two matching tasks' , (t) => {

    const spy = sinon.spy(doTask, 'default');
    const argv = {
        packages: ['package1', 'package2', '@test/package3', '@test/package4'],
        tasks: ['test1', 'test2'],
    };
    return doCommand(argv).then(() => {
        return Promise.all([
            t.is(spy.called, true),
            t.is(spy.calledWith(argv, 'test1', 'package1'), true),
            t.is(spy.calledWith(argv, 'test2', '@test/package3'), true),
        ]).then(() => {
            spy.restore();
        });
    });
});

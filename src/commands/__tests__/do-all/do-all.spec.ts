/* tslint:disable: no-unused-expression */
import * as path from 'path';

import * as chai from 'chai';
import * as sinon from 'sinon';

import * as doTask from '../../../lib/do-task';

import { doAllCommand } from '../../do-all';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');

describe('command: do-all' , () => {
    const TDIR = path.join(CWD);
    before(() => {
        process.chdir(TDIR);
    });
    after(() => {
        process.chdir(OCWD);
    });

    it('runs two commands', () => {
        const spy = sinon.spy(doTask, 'default');
        const argv = {
            tasks: ['test1', 'test2', 'test3'],
        };
        return doAllCommand(argv).then(() => {
            chai.expect(spy.called).to.be.true;
            chai.expect(spy.calledWith(argv, 'test1', 'package1')).to.be.true;
            chai.expect(spy.calledWith(argv, 'test3', 'package1')).to.be.true;
            chai.expect(spy.calledWith(argv, 'test3', 'package2')).to.be.true;
            chai.expect(spy.calledWith(argv, 'test2', '@test/package3')).to.be.true;
            chai.expect(spy.calledWith(argv, 'test3', '@test/package3')).to.be.true;
            chai.expect(spy.calledWith(argv, 'test3', '@test/package4')).to.be.true;
            spy.restore();
        });
    });
});

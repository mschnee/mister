/* tslint:disable: no-unused-expression */
import * as path from 'path';

import * as chai from 'chai';
import * as sinon from 'sinon';

import * as doTask from '../../../lib/do-task';

import { doCommand } from '../../do';

const OCWD = process.cwd();

const CWD = path.resolve(__dirname, 'fixtures');
describe('command: do' , () => {
    const TDIR = path.join(CWD);
    before(() => process.chdir(TDIR));
    after(() => process.chdir(OCWD));

    it('runs two commands on two packages', () => {
        const spy = sinon.spy(doTask, 'default');
        const argv = {
            packages: ['package1', '@test/package3'],
            tasks: ['test1', 'test2'],
        };
        return doCommand(argv).then(() => {
            chai.expect(spy.called).to.be.true;
            chai.expect(spy.calledWith(argv, 'test1', 'package1')).to.be.true;
            chai.expect(spy.calledWith(argv, 'test2', '@test/package3')).to.be.true;
            spy.restore();
        });
    });

    it('runs two commands given four packages but only two matching tasks', () => {
        const spy = sinon.spy(doTask, 'default');
        const argv = {
            packages: ['package1', 'package2', '@test/package3', '@test/package4'],
            tasks: ['test1', 'test2'],
        };
        return doCommand(argv).then(() => {
            chai.expect(spy.called).to.be.true;
            chai.expect(spy.calledWith(argv, 'test1', 'package1')).to.be.true;
            chai.expect(spy.calledWith(argv, 'test2', '@test/package3')).to.be.true;
            spy.restore();
        });
    });
});

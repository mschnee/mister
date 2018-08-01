/* tslint:disable: no-unused-expression */
import * as path from 'path';

import { expect } from 'chai';
import * as sinon from 'sinon';

import * as doTask from '../../../lib/do-task';

import { doCommand } from '../../do';

const OCWD = process.cwd();

const CWD = path.resolve(__dirname, 'fixtures');
describe('command: do --dependencies' , () => {
    const TDIR = path.join(CWD);
    before(() => process.chdir(TDIR));
    after(() => process.chdir(OCWD));

    it('runs with dependencies', () => {
        const spy = sinon.spy(doTask, 'default');
        const argv = {
            'packages': ['@test/package4'],
            'tasks': ['test3'],
            'with-dependencies': true,
        };
        return doCommand(argv).then(() => {
            expect(spy.called).to.be.true;
            expect(spy.calledWith(argv, 'test3', 'package2')).to.be.true;
            expect(spy.calledWith(argv, 'test3', '@test/package3')).to.be.true;
            expect(spy.calledWith(argv, 'test3', '@test/package4')).to.be.true;
            spy.restore();
        });
    });
});

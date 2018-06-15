import { expect } from 'chai';
import * as path from 'path';
import { getLocalPackages } from '../cache';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');

describe('cache', () => {
    describe('getLocalPackages', () => {
        before(() => {process.chdir(CWD);});
        after(() => {process.chdir(OCWD);});

        it('Should correctly list all the packages', () => {
            const packageList = getLocalPackages();
            console.log(packageList)
            expect(packageList.length).to.equal(4);
            expect(packageList.indexOf('package1') >= 0);
            expect(packageList.indexOf('package2') >= 0);
            expect(packageList.indexOf('@test/package3') >= 0);
            expect(packageList.indexOf('@test/package4') >= 0);
        });
    });
});

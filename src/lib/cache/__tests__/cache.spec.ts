import { expect } from 'chai';
import * as path from 'path';
import { getLocalPackages, isPackageUpToDate } from '../cache';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');

describe('cache', () => {
    before(() => {process.chdir(CWD);});
    after(() => {process.chdir(OCWD);});
    describe('getLocalPackages()', () => {

        it('Should correctly list all the packages', () => {
            const packageList = getLocalPackages();
            expect(packageList.length).to.equal(4);
            expect(packageList.indexOf('package1') >= 0);
            expect(packageList.indexOf('package2') >= 0);
            expect(packageList.indexOf('@test/package3') >= 0);
            expect(packageList.indexOf('@test/package4') >= 0);
        });
    });
    
    describe('isPackageUpToDate()', () => {
        it('package1 should be up to date', () => {
            expect(isPackageUpToDate('package1')).to.be.true;
        });
        it('package2 should be up to date', () => {
            expect(isPackageUpToDate('package2')).to.be.true;
        });
        it('package3 should be out od date', () => {
            expect(isPackageUpToDate('@test/package3')).to.be.false;
        });
        it('package4 should be up to date', () => {
            expect(isPackageUpToDate('@test/package4')).to.be.false;
        });
    })
});

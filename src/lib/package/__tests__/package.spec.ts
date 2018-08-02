/* tslint:disable: no-unused-expression */
import * as path from 'path';

import { expect } from 'chai';

import getLocalPackages from '../get-local-packages';
import getMatchingLocalPackages from '../get-matching-local-packages';
import getPackagesForArgs from '../get-packages-for-argv';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture1');

/**
 * Because git cannot actually store mtimes, we have to stub fs.statSync.
 */
describe('package functions', () => {
    before(() => {
        process.chdir(CWD);
    });
    after(() => {
        process.chdir(OCWD);
    });

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

    describe('getMatchingLocalPackages()', () => {
        it('with no params, should return nothing', () => {
            const plist1 = getMatchingLocalPackages();
            expect(plist1.length).to.equal(0);
        });
        it('Should return an in-order list of packages, filtered by params', () => {
            const plist1 = getMatchingLocalPackages(['@test/package3', 'package1']);
            expect(plist1.length).to.equal(2);
            expect(plist1[0]).to.equal('package1');
            expect(plist1[1]).to.equal('@test/package3');
            expect(plist1[2]).to.be.undefined;
        });
    });

    describe('getPackagesForArgs()', () => {
        it('with no params, should throw', () => {
            expect(getPackagesForArgs).to.throw();
        });
        it('with argv.all should return all packages', () => {
            const packageList = getPackagesForArgs({all: true});
            expect(packageList.length).to.equal(4);
            expect(packageList.indexOf('package1') >= 0);
            expect(packageList.indexOf('package2') >= 0);
            expect(packageList.indexOf('@test/package3') >= 0);
            expect(packageList.indexOf('@test/package4') >= 0);
        });
        it('with argv.packages should return matching packages', () => {
            const packageList = getPackagesForArgs({packages: ['not-real-package', 'package1']});
            expect(packageList.length).to.equal(1);
            expect(packageList.indexOf('package1') >= 0);
        });
    });
});

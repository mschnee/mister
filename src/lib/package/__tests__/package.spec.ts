/* tslint:disable: no-unused-expression */
import test from 'ava';
import * as path from 'path';

import getLocalPackages from '../get-local-packages';
import getMatchingLocalPackages from '../get-matching-local-packages';
import getPackagesForArgs from '../get-packages-for-argv';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture1');

test.before(() => {
    process.chdir(CWD);
});

test.after(() => {
    process.chdir(OCWD);
});

test('getLocalPackages() -- Should correctly list all the packages', async (t) => {
    const packageList = getLocalPackages();
    Promise.all([
        t.is(packageList.length, 4),
        t.truthy(packageList.indexOf('package1') >= 0),
        t.truthy(packageList.indexOf('package2') >= 0),
        t.truthy(packageList.indexOf('@test/package3') >= 0),
        t.truthy(packageList.indexOf('@test/package4') >= 0),
    ]);
});

test('getMatchingLocalPackages() -- Should correctly list all the packages', async (t) => {
    const plist1 = getMatchingLocalPackages();
    t.is(plist1.length, 0);
});

test('getMatchingLocalPackages() -- Should return an in-order list of packages, filtered by params', async (t) => {
    const plist1 = getMatchingLocalPackages(['@test/package3', 'package1']);
    t.is(plist1.length, 2);
    t.is(plist1[0], 'package1');
    t.is(plist1[1], '@test/package3');
    t.falsy(plist1[2]);
});

test('getPackagesForArgs() - with no params should throw', (t) => {
    t.throws(() => getPackagesForArgs(null), Error);
});

test('getPackagesForArgs() - with argv.all should return all packages', (t) => {
    const packageList = getPackagesForArgs({all: true});
    t.is(packageList.length, 4);
    t.truthy(packageList.indexOf('package1') >= 0);
    t.truthy(packageList.indexOf('package2') >= 0);
    t.truthy(packageList.indexOf('@test/package3') >= 0);
    t.truthy(packageList.indexOf('@test/package4') >= 0);
});

test('getPackagesForArgs() - with argv.packages should return matching packages', (t) => {
    const packageList = getPackagesForArgs({packages: ['not-real-package', 'package1']});
    t.is(packageList.length, 1);
    t.truthy(packageList.indexOf('package1') >= 0);
});

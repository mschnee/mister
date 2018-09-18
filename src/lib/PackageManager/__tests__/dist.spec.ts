/* tslint:disable: no-unused-expression */
import test from 'ava';
import * as path from 'path';

import PackageManager from '../PackageManager';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture2');

test.beforeEach(() => {
    process.chdir(CWD);
});

test.afterEach(() => {
    process.chdir(OCWD);
});

test('getMonorepoPjson()', (t) => {
    const m = new PackageManager();
    t.is(m.getMonorepoPjson().name, 'monorepo-fixture');
});

test('getPackageDistDependencies() - should get the correct bundleDependencies for @test/package4', (t) => {
    const m = new PackageManager();
    const deps = m.getPackageDistDependencies('@test/package4');
    t.true(deps.hasOwnProperty('package2'));
    t.is(path.resolve(m.getPackageDir('@test/package4'), deps.package2), path.join(CWD, 'dist/package2-10.2.3.tgz'));
});

test('getPackageDistDependencies() - should get the correct bundleDependencies for package2', (t) => {
    const m = new PackageManager();
    const deps = m.getPackageDistDependencies('package2');
    t.true(deps.hasOwnProperty('package1'));
    t.true(deps.hasOwnProperty('express'));
    t.is(deps.express, '1.0.0');
});

test('getPackageDistDependencies() - should get the correct bundleDependencies for @test/package5', (t) => {
    const m = new PackageManager();
    const deps = m.getPackageDistDependencies('@test/package5');
    t.true(deps.hasOwnProperty('@test/package4'));
    t.is(path.resolve(m.getPackageDir('@test/package5'), deps['@test/package4']), path.join(CWD, 'dist/test-package4-10.2.3.tgz'));
});

test('resolveDistFileLocation() - should get the path for @test/package5', (t) => {
    const m = new PackageManager();
    t.is(m.resolveDistfileLocation('@test/package5'), path.join(CWD, 'dist/test-package5-10.2.3.tgz'));
});

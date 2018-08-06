/* tslint:disable: no-unused-expression max-line-length */
import test from 'ava';

import * as path from 'path';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture');
const TDIR = path.join(CWD);

import getPackageLocalDependencies from '../../package/get-package-local-dependencies';
import getDependencyGraph from '../get-dependency-graph';
import getFullDependencyGraph from '../get-full-dependency-graph';

test.before(() => {
    process.chdir(TDIR);
});
test.after(() => {
    process.chdir(OCWD);
});

test('getFullDependencyGraph() - should get all the dependencies in correct order', (t) => {
    const graph = getFullDependencyGraph();
    const deps = graph.overallOrder();
    t.is(deps.length, 14);
    deps.reduce( (prev, name) => {
        // each dependency should already have been satisfied.
        getPackageLocalDependencies(name).forEach((d) => {
            t.truthy(prev.find((n) => n === d));
        });
        return prev.concat(name);
    }, []);
});

test('getDependencyGraph() - should get only the dependencies for @test-web/user-app', (t) => {
    const graph = getDependencyGraph(['@test-web/user-app']);
    const deps = graph.overallOrder();
    t.is(deps.length, 4);
});

test('getDependencyGraph() - should get only the dependencies for @test-web/admin-app and @test-server/notifications', (t) => {
    const graph = getDependencyGraph(['@test-web/admin-app', '@test-server/notifications']);
    const deps = graph.overallOrder();
    t.is(deps.length, 5);
});

/* tslint:disable: no-unused-expression */
import * as path from 'path';

import { expect } from 'chai';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture');

import { clearLocalPackages } from '../../package/get-local-packages';
import getPackageLocalDependencies from '../../package/get-package-local-dependencies';
import getFullDependencyGraph from '../get-full-dependency-graph';

describe('dependencies' , () => {
    const TDIR = path.join(CWD);
    before(() => {
        process.chdir(TDIR);
    });
    after(() => {
        process.chdir(OCWD);
    });

    describe('getFullDependencyGraph', () => {
        it('should get all the dependencies in correct order', () => {
            clearLocalPackages();
            const graph = getFullDependencyGraph();
            const deps = graph.overallOrder();
            expect(deps.length).to.equal(14);
            deps.reduce( (prev, name) => {
                // each dependency should already have been satisfied.
                getPackageLocalDependencies(name).forEach((d) => {
                    expect(prev.find((n) => n === d)).to.not.be.null;
                });
                return prev.concat(name);
            }, []);
        });
    });
});

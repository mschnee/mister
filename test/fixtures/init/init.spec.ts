/**
 * Init fixture tests
 */

import * as path from 'path';
import * as fs from 'fs';

import * as chai from 'chai';
import * as rimraf from 'rimraf';
import * as spawn from 'cross-spawn';

import { initCommand } from '../../../src/commands/init';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname);
describe('Fixtures: Init' , () => {
    describe('empty-project', () => {
        const TDIR = path.join(CWD, 'empty-project');

        before(() => {
            process.chdir(TDIR);
        });
        
        after(() => {
            rimraf.sync(path.join(TDIR, 'packages.json'));
            rimraf.sync(path.join(TDIR, '.gitignore'));
            rimraf.sync(path.join(TDIR, '.mister'));
            process.chdir(OCWD);
            
        });
        it('should create the missing files and directories', () => {
            initCommand(null);

            chai.expect(fs.existsSync(path.join(TDIR, 'packages.json'))).to.be.true;
            chai.expect(fs.existsSync(path.join(TDIR, '.gitignore'))).to.be.true;
        });
    });

    describe('existing-gitignore', () => {
        const TDIR = path.join(CWD, 'existing-gitignore');
        const origGitignore = fs.readFileSync(path.join(TDIR, '.gitignore'));

        before(() => {
            process.chdir(TDIR);
        });

        after(() => {
            rimraf.sync(path.join(TDIR, 'packages.json'));
            rimraf.sync(path.join(TDIR, '.mister'));
            fs.writeFileSync(path.join(TDIR, '.gitignore'), origGitignore);
            process.chdir(OCWD);
        });

        it('should modify the gitignore file to add a ./mister entry', () => {
            initCommand(null);

            const newGitIgnore = fs.readFileSync(path.join(TDIR, '.gitignore'));
            chai.expect(newGitIgnore).to.not.equal(origGitignore);
            const testArr = newGitIgnore.toString().split('\n');
            chai.expect(testArr.length).to.equal(3);

            ['/dist', '/node_modules', '/.mister'].forEach( (k, index) => {
                chai.expect(testArr[index]).to.equal(k)
            })

            chai.expect(fs.existsSync(path.join(TDIR, 'packages.json'))).to.be.true;
        });
    });

    describe('existing-gitignore-with-dotfolder', () => {
        const TDIR = path.join(CWD, 'existing-gitignore-with-dotfolder');
        const origGitignore = fs.readFileSync(path.join(TDIR, '.gitignore'));
        
        before(() => {
            process.chdir(TDIR);
        });
        after(() => {
            process.chdir(OCWD);
        });


        it('should not modify anything', () => {
            initCommand(null);

            const newGitIgnore = fs.readFileSync(path.join(TDIR, '.gitignore'));
            chai.expect(newGitIgnore.toString()).to.equal(origGitignore.toString());
        });
    });
});

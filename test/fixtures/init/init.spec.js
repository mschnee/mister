/**
 * Init fixture tests
 */

const path = require('path');
const fs = require('fs');

const chai = require('chai');
const rimraf = require('rimraf');
const spawn = require('cross-spawn');

const CWD = path.resolve(__dirname);
describe('Fixtures: Init' , () => {
    describe('empty-project', () => {
        const TDIR = path.join(CWD, 'empty-project')
        after(() => {
            rimraf.sync(path.join(TDIR, 'packages.json'));
            rimraf.sync(path.join(TDIR, '.gitignore'));
            rimraf.sync(path.join(TDIR, '.mister'));
            
        });
        it('should create the missing files and directories', () => {
            const ret = spawn.sync('node', [ '../../../../dist/cli.js', 'init'], {
                cwd: path.join(TDIR)
            });

            chai.expect(ret.error).to.not.exist;
            chai.expect(fs.existsSync(path.join(TDIR, 'packages.json'))).to.be.true;
            chai.expect(fs.existsSync(path.join(TDIR, '.gitignore'))).to.be.true;
        });
    });

    describe('existing-gitignore', () => {
        const TDIR = path.join(CWD, 'existing-gitignore');
        const origGitignore = fs.readFileSync(path.join(TDIR, '.gitignore'));

        after(() => {
            rimraf.sync(path.join(TDIR, 'packages.json'));
            rimraf.sync(path.join(TDIR, '.mister'));
            fs.writeFileSync(path.join(TDIR, '.gitignore'), origGitignore);
        });

        it('should modify the gitignore file to add a ./mister entry', () => {
            const ret = spawn.sync('node', [ '../../../../dist/cli.js', 'init'], {
                cwd: path.join(TDIR)
            });

            chai.expect(ret.error).to.not.exist;
            const newGitIgnore = fs.readFileSync(path.join(TDIR, '.gitignore'));
            chai.expect(newGitIgnore).to.not.equal(origGitignore);
            const testArr = newGitIgnore.toString().split('\n');
            chai.expect(testArr.length).to.equal(3);

            [
                '/dist',
                '/node_modules',
                '/.mister'
            ].forEach( (k, index) => {
                chai.expect(testArr[index]).to.equal(k)
            })

            chai.expect(fs.existsSync(path.join(TDIR, 'packages.json'))).to.be.true;
        });
    });

    describe('existing-gitignore-with-dotfolder', () => {
        const TDIR = path.join(CWD, 'existing-gitignore-with-dotfolder');
        const origGitignore = fs.readFileSync(path.join(TDIR, '.gitignore'));


        it('should not modify anything', () => {
            const ret = spawn.sync('node', [ '../../../../dist/cli.js', 'init'], {
                cwd: path.join(TDIR)
            });
            if (ret.stdout) {
                console.info(ret.stdout.toString());
            }
            chai.expect(ret.error).to.not.exist;
            const newGitIgnore = fs.readFileSync(path.join(TDIR, '.gitignore'));
            chai.expect(newGitIgnore).to.equal(origGitignore);
            
        });
    });
});
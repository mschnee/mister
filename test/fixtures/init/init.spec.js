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
        after(() => {
            rimraf.sync([
                path.join(CWD, 'empty-project', 'packages.json'),
                path.join(CWD, 'empty-project', '.gitignore'),
                path.join(CWD, 'empty-project', '.mister'),
            ].join(' '));
        });
        it('should create the missing files and directories', () => {
            const ret = spawn.sync('node', [ '../../../../dist/cli.js'], {
                cwd: path.join(CWD, 'empty-project')
            });
            if (ret.stdout) {
                console.info(ret.stdout.toString());
            }
            chai.expect(ret.error).to.not.exist;
            chai.expect(fs.existsSync(path.join(CWD, 'packages.json'))).to.be.true;
            chai.expect(fs.existsSync(path.join(CWD, '.gitignore'))).to.be.true;
        });
    })
});
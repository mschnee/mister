import * as mockFs from 'mock-fs';
import * as fs from 'fs';
import { expect } from 'chai';
import * as path from 'path';
import { getLocalPackages, isPackageUpToDate } from '../cache';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixtures');

const OLDTIME = new Date('2018-06-14T19:34:42.887Z');
const BUIDDATE = new Date('2018-06-15T19:34:42.887Z');
const NEWTIME = new Date('2018-06-16T19:34:42.887Z');
/**
 * Because git cannot actually store mtimes, we have to stub fs.statSync.
 */
describe('cache', () => {
    before(() => {
        process.chdir(CWD);
        const tdir = path.join(CWD, 'packages/node_modules');
        const buildjson = fs.readFileSync(path.join(CWD, '.mister/build.json'));
        mockFs({
            [`.mister/build.json`]: buildjson,
            [tdir]: {
                package1: {
                    'old.js': mockFs.file({mtime: OLDTIME})
                },
                package2: {
                    '.gitignore': '/ignored',
                    ignored: {
                        'index.js': mockFs.file({mtime: NEWTIME})
                    }
                },
                '@test': {
                    package3: {
                        'test.js': mockFs.file({mtime: NEWTIME})
                    },
                    package4: {
                        '.gitignore': '/ignored',
                        'fail.js': mockFs.file({mtime: NEWTIME}),
                        ignored: {
                            'index.js': mockFs.file({mtime: OLDTIME})
                        }
                    }
                }
            }
        }, null);
    });
    after(() => {
        process.chdir(OCWD);
        mockFs.restore();
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
    
    describe('isPackageUpToDate()', () => {
        it('package1 should be up to date', () => {
            expect(isPackageUpToDate('package1')).to.be.true;
        });
        it('package2 should be up to date', () => {
            expect(isPackageUpToDate('package2')).to.be.true;
        });
        it('package3 should be out of date', () => {
            expect(isPackageUpToDate('@test/package3')).to.be.false;
        });
        it('package4 should be up to date', () => {
            expect(isPackageUpToDate('@test/package4')).to.be.false;
        });
    })
});

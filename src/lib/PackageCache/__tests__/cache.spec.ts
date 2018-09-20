/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as fs from 'fs';
import * as path from 'path';

import * as mockFs from 'mock-fs';

import PackageManager from '../../PackageManager';
import PackageCache from '../PackageCache';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture1');

const OLDTIME = new Date('2018-06-14T19:34:42.887Z');
const BUIDDATE = new Date('2018-06-15T19:34:42.887Z');
const NEWTIME = new Date('2018-06-16T19:34:42.887Z');

test.before(() => {
    process.chdir(CWD);
    const tdir = path.join(CWD, 'packages/node_modules');
    const buildjson = fs.readFileSync(path.join(CWD, '.mister/cache.json'));
    mockFs({
        [`.mister/cache.json`]: buildjson,
        [tdir]: {
            '@test': {
                package3: {
                    'package.json': mockFs.file({mtime: OLDTIME, content:'{"name": "@test/package3"}'}),
                    'test.js': mockFs.file({mtime: NEWTIME}),
                },
                package4: {
                    '.gitignore': '/ignored',
                    'fail.js': mockFs.file({mtime: NEWTIME}),
                    'ignored': {
                        'index.js': mockFs.file({mtime: OLDTIME}),
                    },
                    'package.json': mockFs.file({mtime: OLDTIME, content:'{"name": "@test/package4"}'})
                },
            },
            'package1': {
                'old.js': mockFs.file({mtime: OLDTIME}),
                'package.json': mockFs.file({mtime: OLDTIME, content:'{"name": "package1"}'})
            },
            'package2': {
                '.gitignore': '/ignored',
                'ignored': {
                    'index.js': mockFs.file({mtime: NEWTIME}),
                },
                'package.json': mockFs.file({mtime: OLDTIME, content:'{"name": "package2"}'})
            },
        },
    }, null);
});

test.after(() => {
    process.chdir(OCWD);
    mockFs.restore();
});

test('getCache() packages should be up to date', (t) => {
    const m = new PackageManager();
    const c = new PackageCache(m);
    Promise.all([
        t.truthy(c.isPackageCommandUpToDate('package1', 'build')),
        t.truthy(c.isPackageCommandUpToDate('package2', 'build')),
        t.falsy(c.isPackageCommandUpToDate('@test/package3', 'build')),
        t.falsy(c.isPackageCommandUpToDate('@test/package4', 'build')),
    ]);
});

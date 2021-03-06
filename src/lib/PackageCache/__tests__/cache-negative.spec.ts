/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as path from 'path';

import * as mockFs from 'mock-fs';

import PackageManager from '../../PackageManager';
import PackageCache from '../PackageCache';

const OCWD = process.cwd();
const FAKE_CWD = path.resolve(__dirname, 'fixture2');

const OLDTIME = new Date('2018-06-14T19:34:42.887Z');
const NEWTIME = new Date('2018-06-16T19:34:42.887Z');

test.before(() => {
    process.chdir(FAKE_CWD);
    const tdir = path.join(FAKE_CWD, 'packages/node_modules');
    mockFs({
        [tdir]: {
            '@test': {
                package3: {
                    'test.js': mockFs.file({mtime: NEWTIME}),
                },
                package4: {
                    '.gitignore': '/ignored',
                    'fail.js': mockFs.file({mtime: NEWTIME}),
                    'ignored': {
                        'index.js': mockFs.file({mtime: OLDTIME}),
                    },
                },
            },
            'package1': {
                'old.js': mockFs.file({mtime: OLDTIME}),
            },
            'package2': {
                '.gitignore': '/ignored',
                'ignored': {
                    'index.js': mockFs.file({mtime: NEWTIME}),
                },
            },
        },
    }, null);
});

test.after(() => {
    process.chdir(OCWD);
    mockFs.restore();
});

test('getCache should not fail when there is no cache file', (t) => {
    const m = new PackageManager();
    const c = new PackageCache(m);
    return t.is(c.isPackageCommandUpToDate('package1', 'build'), false);
});

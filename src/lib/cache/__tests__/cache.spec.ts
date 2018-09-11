/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as fs from 'fs';
import * as path from 'path';

import * as mockFs from 'mock-fs';

import getCache, { resetCache } from '../get-cache';
import isPackageUpToDate from '../is-package-up-to-date';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture1');

const OLDTIME = new Date('2018-06-14T19:34:42.887Z');
const BUIDDATE = new Date('2018-06-15T19:34:42.887Z');
const NEWTIME = new Date('2018-06-16T19:34:42.887Z');

test.before(() => {
    process.chdir(CWD);
    const tdir = path.join(CWD, 'packages/node_modules');
    const buildjson = fs.readFileSync(path.join(CWD, '.mister/build.json'));
    mockFs({
        [`.mister/build.json`]: buildjson,
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
    resetCache();
});

test('getCache() packages should be up to date', (t) => {
    Promise.all([
        t.truthy(getCache().packages),
        t.truthy(isPackageUpToDate('packages', 'package1')),
        t.truthy(isPackageUpToDate('packages', 'package2')),
        t.falsy(isPackageUpToDate('packages', '@test/package3')),
        t.falsy(isPackageUpToDate('packages', '@test/package4')),
    ]);
});

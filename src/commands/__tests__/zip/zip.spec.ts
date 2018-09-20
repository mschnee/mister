/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as mktemp from 'mktemp';
import * as unzip from 'unzip';

import * as fs from 'fs';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';

import runProcess from '../../../lib/run-process';
import { handler } from '../../zip';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture');
const TDIR = path.join(CWD);

let tempDir;
test.before(() => {
    rimraf(path.join(CWD, 'packages/node_modules/**/*.tgz'));
    rimraf(path.join(CWD, 'packages/node_modules/**/*.zip'));
    rimraf(path.join(CWD, '.mister'));
    process.chdir(TDIR);
    tempDir = mktemp.createDirSync('zip-test-XXXX');
});

test.after(() => {
    rimraf(tempDir);
    rimraf(path.join(CWD, 'packages/node_modules/**/*.tgz'));
    rimraf(path.join(CWD, 'packages/node_modules/**/*.zip'));
    rimraf(path.join(CWD, '.mister'));
    process.chdir(OCWD);
});

test.beforeEach(() => {
    rimraf(path.join(CWD, 'dist'));
});

test('command: zip', (t) => {
    const args = {
        packages: ['@test-server/api'],
    };
    return runProcess('npm', ['install', '--skip-package-lock'], {
        cwd: path.join(CWD),
    }, {}).then(() => handler(args)).then(() => {
        // check that the tarballs exist.
        t.true(fs.existsSync(path.join(CWD, 'dist', 'test-server-api-2.4.6.zip')));

        const zipStream = fs.createReadStream(path.join(CWD, 'dist', 'test-server-api-2.4.6.zip'))
            .pipe(unzip.Extract({path: tempDir}));

        zipStream.on('close', () => {
            t.true(fs.existsSync(path.join(tempDir, 'node_modules/express/index.js')))
            t.true(fs.existsSync(path.join(tempDir, 'package/node_modules/@test-common/reducer1/package.json')))
            const fl = JSON.parse(fs.readFileSync(path.join(tempDir, 'package/node_modules/@test-common/reducer1/package.json'), 'utf8'))
            t.is(fl, {"name": "unscoped-lib1"})
        });
    });
});

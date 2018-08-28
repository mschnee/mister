import * as fs from 'fs';
import * as path from 'path';

import { sync as rimraf } from 'rimraf';

import test from 'ava';

import npmTgzToZip from '../npm-tgz-to-zip';

const tfile = path.join(__dirname, 'test-server-api-2.4.6.tgz');
const ofile = path.join(__dirname, 'test-server-api-2.4.6.zip');

const OCWD = process.cwd();

test.beforeEach(() => {
    rimraf(ofile);
    process.chdir(path.join(__dirname));
});

test.afterEach(() => {
    process.chdir(OCWD);
});

test('npm-tgz-to-zip', (t) => {
    return npmTgzToZip(tfile, ofile).then(() => {
        t.true(fs.existsSync(ofile));
    });
});

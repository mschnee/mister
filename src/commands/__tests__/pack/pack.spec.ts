/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as fs from 'fs';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';

import { packCommand } from '../../pack';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture');
const TDIR = path.join(CWD);

test.before(() => {
    rimraf(path.join(CWD, 'packages/node_modules/**/*.tgz'));
    process.chdir(TDIR);
});

test.after(() => {
    process.chdir(OCWD);
});

test.beforeEach(() => {
    rimraf(path.join(CWD, 'dist'));
});

test('command: pack', (t) => {
    const args = {
        _: ['@test-server/api'],
        v: 2,
    };
    return packCommand(args).then(() => {
        // check that the tarballs exist.
        t.true(fs.existsSync(path.join(CWD, 'dist', 'test-server-api-2.4.6.tgz')));
    });
});

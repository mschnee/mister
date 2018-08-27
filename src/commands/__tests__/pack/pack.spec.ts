/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as tar from 'tar';

import * as fs from 'fs';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';

import runProcess from '../../../lib/run-process';
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
        '_': ['@test-server/api'],
        'debug-persist-package-json': false,
    };
    return runProcess('npm', ['install'], {
        cwd: path.join(CWD),
    }, {}).then(() => packCommand(args).then(() => {
        // check that the tarballs exist.
        t.true(fs.existsSync(path.join(CWD, 'dist', 'test-server-api-2.4.6.tgz')));
        const entries = [];
        tar.t({
            file: path.join(CWD, 'dist', 'test-server-api-2.4.6.tgz'),
            onentry: (e) => entries.push(e),
        }).then((r) => {
            t.true(entries.indexOf('package/node_modules/@test-common/reducer1/package.json') >= 0);
            t.true(entries.indexOf('package/node_modules/express/index.js') >= 0);
            t.false(fs.existsSync(path.join(CWD, 'packages/node_modules/@test-server/api/node_modules')));
        });
    }));
});
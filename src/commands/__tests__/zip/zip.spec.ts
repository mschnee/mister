/* tslint:disable: no-unused-expression */
import test from 'ava';

import * as unzip from 'unzip';

import * as fs from 'fs';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';

import runProcess from '../../../lib/run-process';
import { zipCommand } from '../../zip';

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

test('command: zip', (t) => {
    const args = {
        _: ['@test-server/api'],
    };
    return runProcess('npm', ['install'], {
        cwd: path.join(CWD),
    }, {}).then(() => zipCommand(args).then(() => {
        // check that the tarballs exist.
        t.true(fs.existsSync(path.join(CWD, 'dist', 'test-server-api-2.4.6.zip')));
        const entries = [];
        const zipStream = fs.createReadStream(path.join(CWD, 'dist', 'test-server-api-2.4.6.zip'))
            .pipe(unzip.Parse());

        zipStream.on('entry', (e) => {
            entries.push(e.path);
        });
        zipStream.on('end', () => {
            t.true(entries.indexOf('node_modules/express/index.js') >= 0);
            t.true(entries.indexOf('package/node_modules/@test-common/reducer1/package.json') >= 0);
        });
    }));
});

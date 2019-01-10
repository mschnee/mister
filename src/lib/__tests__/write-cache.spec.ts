import * as fs from 'fs';
import * as path from 'path';

import test from 'ava';
import { sync as rimraf } from 'rimraf';

import { handler } from '../../commands/zip';
import runProcess from '../../lib/run-process';

const OCWD = process.cwd();
const CWD = path.resolve(__dirname, 'fixture');
const TDIR = path.join(CWD);

test.before(() => {
    rimraf(path.join(CWD, 'packages/node_modules/**/*.tgz'));
    rimraf(path.join(CWD, 'packages/node_modules/**/*.zip'));
    rimraf(path.join(CWD, '.mister'));
    process.chdir(TDIR);
});

test.after(() => {
    rimraf(path.join(CWD, 'packages/node_modules/**/*.tgz'));
    rimraf(path.join(CWD, 'packages/node_modules/**/*.zip'));
    rimraf(path.join(CWD, '.mister'));
    process.chdir(OCWD);
});

test('Verify that cache creation works', (t) => {
    const args = {
        'package-version': false,
        'packages': ['@test-server/api'],
        'quiet': true
    };
    return runProcess('npm', ['install', '--skip-package-lock', '--no-save'], {
        cwd: path.join(CWD),
    }, {}).then(() => handler(args)).then(() => {
        // ensure all the things exist.
        t.true(fs.existsSync(path.join(CWD, '.mister', 'cache.json')));
        const cacheJson = JSON.parse(fs.readFileSync(path.join(CWD, '.mister', 'cache.json'), 'utf8'));
        t.true(cacheJson.hasOwnProperty('packages'));
        t.true(cacheJson.packages.hasOwnProperty('@test-server/api'));
        t.true(cacheJson.packages['@test-server/api'].hasOwnProperty('commandTimestamps'));
        t.true(cacheJson.packages['@test-server/api'].commandTimestamps.hasOwnProperty('pack'));
        t.true(cacheJson.packages['@test-server/api'].commandTimestamps.hasOwnProperty('zip'));

        t.true(cacheJson.packages.hasOwnProperty('@test-common/reducer1'));
        t.true(cacheJson.packages['@test-common/reducer1'].hasOwnProperty('commandTimestamps'));
        t.true(cacheJson.packages['@test-common/reducer1'].commandTimestamps.hasOwnProperty('pack'));
    })
})

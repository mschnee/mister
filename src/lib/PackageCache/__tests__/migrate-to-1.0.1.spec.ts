import * as path from 'path';

import test from 'ava';

import PackageManager from '../../PackageManager';
import PackageCache from '../PackageCache';

const CWD = path.resolve(__dirname, 'fixture3');

test.before(() => {
    process.chdir(CWD);
});

test('Migrate from 1.0.0 to 1.0.1', (t) => {
    const m = new PackageManager();
    const c = new PackageCache(m);

    const newCache = c.getCache();
    const p = newCache.get('packages');

    t.truthy(p.has('@lambda/test-fn'));

    const testFnDeps = p.get('@lambda/test-fn').get('dependencies');
    t.truthy(testFnDeps.has('@config/get-ssm-params'));
    t.truthy(testFnDeps.get('@config/get-ssm-params').has('commandTimestamps'));
    t.truthy(testFnDeps.get('@config/get-ssm-params').get('commandTimestamps').has('pack'))
    t.is(testFnDeps.get('@config/get-ssm-params').get('commandTimestamps').get('pack'), new Date('2018-09-21T18:57:47.749Z'))
});

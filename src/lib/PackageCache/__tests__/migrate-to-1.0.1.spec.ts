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
    t.truthy(newCache.packages.hasOwnProperty('@lambda/test-fn'));
    t.truthy(newCache.packages['@lambda/test-fn'].dependencies.hasOwnProperty('@config/get-ssm-params'));
    t.truthy(newCache.packages['@lambda/test-fn'].dependencies['@config/get-ssm-params'].hasOwnProperty('commandTimestamps'));
    t.truthy(newCache.packages['@lambda/test-fn'].dependencies['@config/get-ssm-params'].commandTimestamps.hasOwnProperty('pack'))
    t.is(newCache.packages['@lambda/test-fn'].dependencies['@config/get-ssm-params'].commandTimestamps.pack, '2018-09-21T18:57:47.749Z');
});

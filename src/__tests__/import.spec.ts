import test from 'ava';
import * as mister from '../index';
import * as misterLib from '../lib';

test('importing mister works', (t) => {
    t.truthy(mister.cache);
    t.truthy(misterLib.cache);
});

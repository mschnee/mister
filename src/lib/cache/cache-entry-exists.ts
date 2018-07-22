import * as debug from 'debug';
const cacheDebugger = debug('mister:cache');

import { BuildCache } from './get-cache';

export default function cacheEntryExists(cache: BuildCache, packageName: string) {
    return (
        cache.hasOwnProperty('packages')
        && cache.packages.hasOwnProperty(packageName)
    );
}

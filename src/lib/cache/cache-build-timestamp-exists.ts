import cacheEntryExists from './cache-entry-exists';
import { BuildCache } from './get-cache';

export default function cacheBuildTimestampExists(cache: BuildCache, packageName: string) {
    return (
        cacheEntryExists(cache, packageName)
        && cache.packages[packageName].hasOwnProperty('lastBuildTime')
    );
}

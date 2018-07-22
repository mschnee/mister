import * as fs from 'fs';
import * as path from 'path';

import * as debug from 'debug';
const cacheDebugger = debug('mister:cache');

let buildCache = null;

export interface BuildCache {
    packages: {
        [packageName: string]: BuildCacheEntry;
    };
}

export interface BuildCacheEntry {
    lastBuildTime: Date;
    lastPackageTime?: Date;
    dependencies?: {
        [packageName: string]: Date;
    };
}

export default function getCache(): BuildCache {
    if (!buildCache) {
        const CACHE_DIR = path.join(process.cwd(), '.mister');
        const buildFile = path.join(CACHE_DIR, 'build.json');
        try {
            if (fs.existsSync(buildFile)) {
                buildCache = JSON.parse(fs.readFileSync(buildFile, 'utf8'));
            } else {
                cacheDebugger(buildFile, 'does not exist');
                buildCache = {};
            }
        } catch (e) {
            cacheDebugger(e);
            buildCache = {};
        }
    }

    return buildCache;
}

export function resetCache() {
    buildCache = null;
}

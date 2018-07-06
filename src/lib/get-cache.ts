import * as fs from 'fs';
import * as path from 'path';

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
    const CACHE_DIR = path.join(process.cwd(), '.mister');
    const buildFile = path.join(CACHE_DIR, 'build.json');

    if (!buildCache) {
        try {
            if (fs.existsSync(buildFile)) {
                buildCache = JSON.parse(fs.readFileSync(buildFile, 'utf8'));
            } else {
                buildCache = {};
            }
        } catch (e) {
            buildCache = {};
        }
    }

    return buildCache;
}

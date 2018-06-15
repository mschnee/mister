import * as fs from 'fs';
import * as path from 'path';

let _cache = null;
export default function getCache() {
    const CACHE_DIR = path.join(process.cwd(), '.mister');
    const buildFile = path.join(CACHE_DIR, 'build.json');
    if (!_cache) {
        try {
            if (fs.existsSync(buildFile)) {
                _cache = JSON.parse(fs.readFileSync(buildFile, 'utf8'));
            } else {
                _cache = {};
            }
        } catch (e) {
            _cache = {};
        }
    } 
    return _cache;
}

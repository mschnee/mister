import * as fs from 'fs';
import * as path from 'path';

/* istanbul ignore next */
interface PjsonDeps {
    [key: string]: string;
}

/* istanbul ignore next */
interface PjsonFile {
    name: string;
    version: string;
    dependencies: PjsonDeps;
    devDependencies: PjsonDeps;
}

let pjsonCache: Buffer = null;

export default function getMonorepoPjson(): PjsonFile {
    if (!pjsonCache) {
        const p = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(p)) {
            throw new Error(`Could not find a package.json file.  Are you in the right directory?`);
        }
        pjsonCache = fs.readFileSync(p);
    }

    try {
        return JSON.parse(pjsonCache.toString());
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.error('Error parsing monorepo package.json');
        throw e;
    }
}

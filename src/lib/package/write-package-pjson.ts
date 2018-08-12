import * as fs from 'fs';
import * as path from 'path';

import getPackageDir from './get-package-dir';
import getPackagePjson from './get-package-pjson';

export default function writePackagePjson(packageName, pjson) {
    // ensure the original buffer is cached
    getPackagePjson(packageName);
    const p = path.join(getPackageDir(packageName), 'package.json');
    fs.writeFileSync(p, JSON.stringify(pjson, null, 4));
}

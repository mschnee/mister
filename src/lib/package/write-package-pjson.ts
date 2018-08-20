import * as fs from 'fs';
import * as path from 'path';

import getPackageDir from './get-package-dir';
import getPackagePjson from './get-package-pjson';

export default function writePackagePjson(argv, packageName, pjson) {
    // ensure the original buffer is cached
    getPackagePjson(packageName);

    if (argv.verbose >= 1) {
        console.log('Writing temp package.json for', packageName); // tslint:disable-line
    }
    const p = path.join(getPackageDir(packageName), 'package.json');
    fs.writeFileSync(p, JSON.stringify(pjson, null, 4));
}

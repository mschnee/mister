import * as fs from 'fs';
import * as path from 'path';

import getPackageDir from './get-package-dir';
import getPackagePjson from './get-package-pjson';

export default function writePackagePjson(argv, packageName, pjson) {
    // ensure the original buffer is cached
    getPackagePjson(argv['package-prefix'], packageName);

    /* istanbul ignore if */
    if (argv.verbose >= 2) {
        console.log('Writing temp package.json for', packageName); // tslint:disable-line
    }
    const p = path.join(getPackageDir(argv['package-prefix'], packageName), 'package.json');
    fs.writeFileSync(p, JSON.stringify(pjson, null, 4));
}

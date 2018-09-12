import * as path from 'path';

import { sync as rimraf } from 'rimraf';

import getPackageDir from './get-package-dir';

export default function preparePackage(packagePrefix, packageName) {
    const dir = getPackageDir(packagePrefix, packageName);
    rimraf(path.join(dir, 'node_modules'));
    rimraf(path.join(dir, 'package-lock.json'));
}

import * as path from 'path';

import getPackageDistFileName from './get-package-dist-filename';
/**
 * Lookup what is- or what will be, the distfile location for a given package.
 * @param packageName
 */
export default function resolveDistFileLocation(packageName) {
    return path.join(process.cwd(), 'dist', getPackageDistFileName(packageName));
}

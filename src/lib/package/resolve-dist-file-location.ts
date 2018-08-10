import * as path from 'path';

import getMonorepoPjson from './get-monorepo-pjson';

/**
 * Lookup what is- or what will be, the distfile location for a given package.
 * @param packageName
 */
export default function resolveDistFileLocation(packageName) {
    const mrjson = getMonorepoPjson();

    // see https://github.com/npm/cli/blob/latest/lib/pack.js
    const name = packageName[0] === '@'
        ? packageName.substr(1).replace(/\//g, '-')
        : packageName;
    const target = `${name}-${mrjson.version}.tgz`;

    return path.join(process.cwd(), 'dist', target);
}

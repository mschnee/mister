import getMonorepoPjson from './get-monorepo-pjson';

export default function getPackageDistFileName(packageName) {
    const mrjson = getMonorepoPjson();

    // see https://github.com/npm/cli/blob/latest/lib/pack.js
    const name = packageName[0] === '@'
        ? packageName.substr(1).replace(/\//g, '-')
        : packageName;

    return `${name}-${mrjson.version}.tgz`;
}

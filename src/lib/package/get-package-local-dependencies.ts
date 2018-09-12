import getLocalPackages from './get-local-packages';
import getPackagePjson from './get-package-pjson';

export default function getPackageLocalDependencies(packagePrefix, packageName) {
    const pjson = getPackagePjson(packagePrefix, packageName);

    return Object.keys(pjson.dependencies || {})
        .concat(Object.keys(pjson.devDependencies || {}))
        .filter((d) => !!getLocalPackages(packagePrefix).find((l) => d === l));
}

import getLocalPackages from './get-local-packages';
import getPackagePjson from './get-package-pjson';

export default function getPackageLocalDependencies(packageName) {
    const pjson = getPackagePjson(packageName);

    return Object.keys(pjson.dependencies || {})
        .concat(Object.keys(pjson.devDependencies || {}))
        .filter((d) => !!getLocalPackages().find((l) => d === l));
}

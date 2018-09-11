import getMonorepoPjson from './get-monorepo-pjson';
import getPackageDistDependencies from './get-package-dist-dependencies';
import getPackagePjson from './get-package-pjson';

export default function getUpdatedPjsonForDist(packagePrefix, packageName: string) {
    const pjson = getPackagePjson(packagePrefix, packageName);
    const mrjson = getMonorepoPjson();
    const nd = getPackageDistDependencies(packagePrefix, packageName);

    delete pjson.dependencies;
    delete pjson.devDependencies;

    pjson.version = mrjson.version;
    pjson.dependencies = nd;
    return pjson;
}

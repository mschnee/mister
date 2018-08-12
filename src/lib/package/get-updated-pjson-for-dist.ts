import getMonorepoPjson from './get-monorepo-pjson';
import getPackageDistDependencies from './get-package-dist-dependencies';
import getPackagePjson from './get-package-pjson';

export default function getUpdatedPjsonForDist(packageName: string) {
    const pjson = getPackagePjson(packageName);
    const mrjson = getMonorepoPjson();
    const nd = getPackageDistDependencies(packageName);

    delete pjson.dependencies;
    delete pjson.devDependencies;

    pjson.version = mrjson.version;
    pjson.dependenceis = nd;
    return pjson;
}

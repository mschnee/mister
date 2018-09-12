import { DepGraph } from 'dependency-graph';

import getLocalPackages from '../package/get-local-packages';
import getPackageLocalDependencies from '../package/get-package-local-dependencies';

let cachedDep;
export default function getFullDependencyGraph(packagePrefix) {
    if (!cachedDep) {
        cachedDep = new DepGraph({circular: false});

        getLocalPackages(packagePrefix).forEach((packageName) => {
            cachedDep.addNode(packageName);

            getPackageLocalDependencies(packagePrefix, packageName).forEach((d) => {
                if (!cachedDep.hasNode(d)) {
                    cachedDep.addNode(d);
                }
                cachedDep.addDependency(packageName, d);
            });
        });
    }

    return cachedDep;
}

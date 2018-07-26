import { DepGraph } from 'dependency-graph';

import getLocalPackages from './cache/get-local-packages';
import getPackageLocalDependencies from './get-package-local-dependencies';

export default function getDependencyGraph() {
    const dep = new DepGraph({circular: false});

    getLocalPackages().forEach((packageName) => {
        dep.addNode(packageName);

        getPackageLocalDependencies(packageName).forEach((d) => {
            if (!dep.hasNode(d)) {
                dep.addNode(d);
            }
            dep.addDependency(packageName, d);
        });
    });

    return dep;
}

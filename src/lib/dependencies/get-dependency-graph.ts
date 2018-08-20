import { DepGraph } from 'dependency-graph';

import getPackageLocalDependencies from '../package/get-package-local-dependencies';

export default function getDependencyGraph(packages: string[]) {
    const dep = new DepGraph({circular: false});

    packages.forEach((packageName) => {
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

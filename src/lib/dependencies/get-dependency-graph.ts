import { DepGraph } from 'dependency-graph';

import getPackageLocalDependencies from '../package/get-package-local-dependencies';

export default function getDependencyGraph(packages: string[]) {
    const dep = new DepGraph({circular: false});

    packages.forEach((packageName) => {
        dep.addNode(packageName);

        console.log(packageName)
        getPackageLocalDependencies(packageName).forEach((d) => {
            console.log(d);
            if (!dep.hasNode(d)) {
                dep.addNode(d);
            }
            dep.addDependency(packageName, d);
        });
    });

    return dep;
}

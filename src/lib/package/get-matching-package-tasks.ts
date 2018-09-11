import getPackageTasks from './get-package-tasks';

export default function getMatchingPackageTasks(packagePrefix, packageName, tasks?: string[]) {
    return getPackageTasks(packagePrefix, packageName)
        .filter((taskName) => tasks.find((t) => t === taskName));
}

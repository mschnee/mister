import getPackageTasks from './get-package-tasks';

export default function getMatchingPackageTasks(packageName, tasks?: string[]) {
    return getPackageTasks(packageName)
        .filter((taskName) => tasks.find((t) => t === taskName));
}

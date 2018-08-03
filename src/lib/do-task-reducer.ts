import doTask from './do-task';
import getMatchingPackageTasks from './package/get-matching-package-tasks';

export default function doTaskOnReducer(argv, accum, packageName) {
    return getMatchingPackageTasks(packageName, argv.tasks).reduce((a, task) => {
        return a.then( () => {
            return doTask(argv, task, packageName);
        });
    }, accum);
}

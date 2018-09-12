import doTask from './do-task';
import getMatchingPackageTasks from './package/get-matching-package-tasks';

export default function doTaskOnReducer(argv, accum, packageName) {
    return getMatchingPackageTasks(argv['package-prefix'], packageName, argv.tasks || argv._).reduce((a, task) => {
        return a.then( () => {
            return doTask(argv, task, packageName);
        });
    }, accum);
}

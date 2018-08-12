import doTask from './do-task';

export default function doSingleTask(argv, task, accum, packageName) {
    return accum.then( () => {
        return doTask(argv, task, packageName);
    });
}

import getPackagePjson from './get-package-pjson';

export default function getPackageTasks(packagePrefix, packageName: string): string[] {
    const pjson = getPackagePjson(packagePrefix, packageName);
    if (pjson.hasOwnProperty('scripts')) {
        return Object.keys(pjson.scripts);
    } else {
        return [];
    }
}

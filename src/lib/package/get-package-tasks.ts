import getPackagePjson from './get-package-pjson';

export default function getPackageTasks(packageName: string): string[] {
    const pjson = getPackagePjson(packageName);
    if (pjson.hasOwnProperty('scripts')) {
        return Object.keys(pjson.scripts);
    } else {
        return [];
    }
}

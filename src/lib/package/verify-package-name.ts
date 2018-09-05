import getPackagePjson from './get-package-pjson';

export default async function verifyPackageName(packageName) {
    const pjson = getPackagePjson(packageName);
    if (pjson.name !== packageName) {
        throw new Error(`Name mismatch between directory '${packageName}' and package.json name ${pjson.name}`);
    }
}

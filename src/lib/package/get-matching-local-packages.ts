import getLocalPackages from './get-local-packages';

export default function getMatchingLocalPackages(packagePrefix, packages?: string[]) {
    if (!packages) {
        return [];
    }
    const p = getLocalPackages(packagePrefix);
    return p.filter((name) => packages.find((i) => i === name));
}

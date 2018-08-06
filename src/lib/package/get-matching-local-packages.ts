import getLocalPackages from './get-local-packages';

export default function getMatchingLocalPackages(packages?: string[]) {
    if (!packages) {
        return [];
    }
    const p = getLocalPackages();
    return p.filter((name) => packages.find((i) => i === name));
}

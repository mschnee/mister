import getLocalPackages from './get-local-packages';
import getMatchingLocalPackages from './get-matching-local-packages';

export default function getPackagesForArgs(argv) {
    if (argv.all) {
        return getLocalPackages(argv['package-prefix']);
    } else if (argv.packages) {
        return getMatchingLocalPackages(argv['package-prefix'], argv.packages);
    } else {
        throw new Error('No Packages supplied.  Did you mean to use --all?');
    }
}

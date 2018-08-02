import getLocalPackages from './get-local-packages';
import getMatchingLocalPackages from './get-matching-local-packages';

export default function getPackagesForArgs(argv) {
    if (argv.all) {
        return getLocalPackages();
    } else if (argv.packages) {
        return getMatchingLocalPackages(argv.packages);
    } else {
        throw new Error('No Packages supplied.  Did you mean to use --all?');
    }
}

import * as fs from 'fs';
import * as path from 'path';

exports.command = 'init';
exports.describe = 'Initializes the files/directories that mister requires';
exports.handler = initCommand;
exports.builder = (yargs) => yargs;
 /**
 * Initializes mister in the current directory:
 * create the .build/ folder
 * Create a package.json if it doesn't exist,
 * Create a .gitignore if it doesn't exist.
 */
export function initCommand(argv:any) {
    const CWD = process.cwd();
    const PACKAGES_FILE = path.join(CWD, 'packages.json');
    const IGNORE_FILE = path.join(CWD, '.gitignore');

    if (!fs.existsSync(PACKAGES_FILE)) {
        fs.writeFileSync(PACKAGES_FILE, '{}', 'utf8');
    }

    if (!fs.existsSync(IGNORE_FILE)) {
        fs.writeFileSync(IGNORE_FILE, '/.build', 'utf8');
    } else {
        checkAndUpdateIgnoreFile(IGNORE_FILE);
    }
}

export function checkAndUpdateIgnoreFile(f: string) {
    const b = fs.readFileSync(f);
    const hasBuildIgnore = b.toString().split('\n').some((line: string) => {
        if (line.trim() === '/.build') {
            return true;
        } else {
            return false;
        }
    });

    if (!hasBuildIgnore) {
        fs.writeFileSync(f, Buffer.concat([b, new Buffer('\n/.mister')]));
    }
}

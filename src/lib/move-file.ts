import * as fs from 'fs';
import * as path from 'path';

import { sync as mkdir } from 'mkdirp';

export default function moveFile(argv, oldPath, newPath) {
    return new Promise((resolve, reject) => {
        if (argv.verbose >= 1) {
            console.log('rename', oldPath, newPath);
        }

        const newFolder = path.dirname(newPath);
        if (!fs.existsSync(newFolder)) {
            mkdir(newFolder);
        }

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

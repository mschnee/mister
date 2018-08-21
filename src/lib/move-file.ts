import * as fs from 'fs';
import * as path from 'path';

import { sync as mkdir } from 'mkdirp';

export default function moveFile(argv, oldPath, newPath) {
    return new Promise((resolve, reject) => {
        /* istanbul ignore if */
        if (argv.verbose >= 1) {
            console.log('rename', oldPath, newPath); // tslint:disable-line
        }

        const newFolder = path.dirname(newPath);
        if (!fs.existsSync(newFolder)) {
            mkdir(newFolder);
        }

        fs.rename(oldPath, newPath, (err) => {
            // as a built-in, it doesn't make sense negative testing this specifically- only higher-level code.
            /* istanbul ignore if */
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

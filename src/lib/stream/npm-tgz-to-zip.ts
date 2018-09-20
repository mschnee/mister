import * as fs from 'fs';

import * as tarToZip from 'tar-to-zip';


function fileRename(file: any) {
    return {
        name: file.name.replace('package/', '')
    }
}

/**
 * Takes a tgz created by `npm pack` and puts it's `./package/` contents into a zip file.
 * @param tgzFileName
 * @param zipFileName
 */
export default function npmTgzToZip(tgzFileName, zipFileName) {
    return new Promise((resolve, reject) => {
        const ofile = fs.createWriteStream(zipFileName);
        tarToZip(tgzFileName, {map: fileRename})
            .on('error', reject)
            .getStream()
            .pipe(ofile)
            .on('finish', resolve);
    });
}

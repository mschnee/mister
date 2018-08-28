import * as fs from 'fs';
import { Transform } from 'stream';

import * as gunzip from 'gunzip-maybe';
import * as tarStream from 'tar-stream';

/**
 * Takes a tgz created by `npm pack` and puts it's `./package/` contents into a zip file.
 * @param tgzFileName
 * @param zipFileName
 */
export default function npmTgzToZip(tgzFileName, zipFileName) {
    return new Promise((resolve, reject) => {
        const inStream = fs.createReadStream(tgzFileName);
        const oStream = fs.createWriteStream(zipFileName);

        inStream.pipe(gunzip()).pipe(tarStream());
    });
}

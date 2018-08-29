import * as fs from 'fs';
import { Transform } from 'stream';

import * as archiver from 'archiver';
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
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });
        const oStream = fs.createWriteStream(zipFileName);

        archive.pipe(oStream);

        const xstream = tarStream.extract();
        xstream.on('entry', (header, stream, done) => {
            archive.append(stream, { name: header.name.replace('package/', '')});
            stream.on('end', done);
            stream.resume();
        });

        xstream.on('finish', () => {
            archive.finalize();
        });

        xstream.on('error', (e) => {
            reject(e);
        });

        inStream.pipe(gunzip()).pipe(xstream);

        oStream.on('close', () => {
            resolve();
        });
    });
}

import { SpawnOptions } from 'child_process';
import * as spawn from 'cross-spawn';

export default function runProcess(command: string, args: string[], options: SpawnOptions, verbose: boolean = false) {
    return new Promise((resolve, reject) => {
        const runProc = spawn(command, args, options);

        if (verbose) {
            runProc.stdout.on('data', (d: Buffer) => {
                // tslint:disable-next-line:no-console
                console.log(d.toString());
            });
        }

        runProc.stderr.on('data', (d: Buffer) => {
            // tslint:disable-next-line:no-console
            console.error(d.toString());
        });

        runProc.on('exit', (code: number, signal: string) => {
            if (code !== 0) {
                reject(code);
            } else {
                resolve();
            }
        });
    });
}

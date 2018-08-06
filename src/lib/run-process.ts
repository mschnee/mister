import { SpawnOptions } from 'child_process';
import * as spawn from 'cross-spawn';

export default function runProcess(command: string, args: string[], options: SpawnOptions, argv: any) {
    return new Promise((resolve, reject) => {
        if (argv.verbose >= 2) {
            options.stdio = options.stdio || 'inherit';
        } else if (argv.stdio) {
            options.stdio = options.stdio || ['pipe', 'pipe', process.stderr];
        }

        const runProc = spawn(command, args, options);

        runProc.on('exit', (code: number, signal: string) => {
            if (code !== 0) {
                reject(code);
            } else {
                resolve();
            }
        });
    });
}

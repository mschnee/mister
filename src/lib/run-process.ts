import { SpawnOptions } from 'child_process';
import * as spawn from 'cross-spawn';

import chalk from 'chalk';
import wrap from '../lib/output/wrap';

export default function runProcess(command: string, args: string[], options: SpawnOptions, argv: any) {
    return new Promise((resolve, reject) => {
        /* istanbul ignore next */
        if (argv.verbose >= 3 || argv.stdio) {
            options.stdio = options.stdio || 'inherit';
        }

        if (argv.verbose >= 2) {
            /* tslint:disable */
            console.log(wrap('[]', 'run-process', chalk.yellow));
            console.log(chalk.yellow('      cwd:'), options.cwd);
            console.log(chalk.yellow('  command:'), command);
            console.log(chalk.yellow('     args:'), args.join(' '));
            /* tslint:enable */
        }

        try {
            const runProc = spawn(command, args, options);
            let errBuffer;

            if (runProc.stdout) {
                runProc.stdout.on('data', (d: Buffer) => {
                    errBuffer = errBuffer ? Buffer.concat([errBuffer, d]) : d;
                });
            }

            if (runProc.stderr) {
                runProc.stderr.on('data', (d: Buffer) => {
                    errBuffer = errBuffer ? Buffer.concat([errBuffer, Buffer.from(chalk.red(d.toString()))]) : d;
                });
            }

            runProc.on('exit', (code: number, signal: string) => {
                if (code !== 0) {
                    const e = new Error(`${wrap('[]', 'run-process', chalk.bold.red)} failed: ${command} ${args.join(' ')}\nOutput\n======\n\n${errBuffer.toString()}`);
                    e.stack = errBuffer.toString();
                    reject(e);
                } else {
                    resolve();
                }
            });
        } catch (e) {
            reject(e)
        }
    });
}

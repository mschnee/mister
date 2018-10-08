import { SpawnOptions } from 'child_process';
import * as spawn from 'cross-spawn';
import { EOL } from 'os';

import chalk from 'chalk';
import wrap from '../lib/output/wrap';

export default function runProcess(command: string, args: string[], options: SpawnOptions, argv: any) {
    return new Promise((resolve, reject) => {
        /* istanbul ignore next */
        if (argv.verbose >= 4 || argv.stdio) {
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
                    if (argv.verbose >= 3) {
                        d.toString().split(EOL).forEach(l => {
                            /* tslint:disable-next-line no-console */
                            console.log(wrap('[]', 'run-process', chalk.gray), l);
                        });
                    }
                });
            }

            if (runProc.stderr) {
                runProc.stderr.on('data', (d: Buffer) => {
                    errBuffer = errBuffer ? Buffer.concat([errBuffer, Buffer.from(chalk.red(d.toString()))]) : d;
                    d.toString().split(EOL).forEach(l => {
                        /* tslint:disable-next-line no-console */
                        console.log(wrap('[]', 'run-process', chalk.gray), chalk.red(l));
                    });
                });
            }

            runProc.on('error', (e) => {
                reject(e);
            });

            runProc.on('exit', (code: number, signal: string) => {
                if (code !== 0) {
                    const e = new Error(`${wrap('[]', 'run-process', chalk.bold.red)} failed: ${command} ${args.join(' ')}\nOutput\n======\n\n${errBuffer && errBuffer.toString()}`);

                    if (errBuffer) {
                        e.stack = errBuffer.toString();
                    }

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

import chalk from 'chalk';

export default function wrap(str: string, wrapped: string, fn = chalk.bold.green) {
    const l = str.substring(0, Math.floor(str.length / 2));
    const r = str.substring(Math.floor(str.length / 2));

    return chalk.bold.white(l) + fn(wrapped) + chalk.bold.white(r);
}

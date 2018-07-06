import * as fs from 'fs';
import * as path from 'path';
import { Argv } from 'yargs';

exports.command = 'do';
exports.describe = 'Runs npm tasks on packages';
exports.usage = 'mister do task1 task1 -- package1 package2';
exports.handler = doCommand;
exports.builder = (yargs: Argv) => yargs.option('v', {
    alias: 'verbose',
    count: true,
    description: 'Apply levels of verbosity',
});

function doCommand(argv) {
    console.log(argv.argv);
}

import * as path from 'path';

import * as yargs from 'yargs';

yargs.commandDir('commands')
    .demandCommand()
    .help()
    .argv;
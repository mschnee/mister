import * as yargs from 'yargs';

/* tslint:disable-next-line */
yargs.commandDir('commands')
    .demandCommand()
    .help()
    .argv;

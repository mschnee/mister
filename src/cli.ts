
/* tslint:disable-next-line */
require('yargs')
    .help()
    .showHelpOnFail(true)
    .commandDir('commands')
    .demandCommand(1)
    .argv;

#!/usr/bin/env node
/* istanbul ignore next */
require('yargs') // tslint:disable-line
    .help()
    .strict()
    .showHelpOnFail(true)
    .commandDir('commands')
    .demandCommand(1)
    .options('stdio', {
        default: false,
        type: 'boolean',
    })
    .fail((msg, err, yargs) => {
        // process.exit(1);
    })
    .argv;

#!/usr/bin/env node
/* tslint:disable-next-line */
require('yargs')
    .help()
    .showHelpOnFail(true)
    .commandDir('commands')
    .demandCommand(1)
    .options('stdio', {
        default: true,
        type: 'boolean',
    })
    .argv;

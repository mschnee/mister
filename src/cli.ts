#!/usr/bin/env node
/* istanbul ignore next */
require('yargs') // tslint:disable-line
    .help()
    .showHelpOnFail(true)
    .commandDir('commands')
    .demandCommand(1)
    .options('stdio', {
        default: true,
        type: 'boolean',
    })
    .argv;

#!/usr/bin/env node
/* istanbul ignore next */
require('yargs') // tslint:disable-line
    .help()
    .strict()
    .showHelpOnFail(true)
    .commandDir('commands')
    .demandCommand(1)
    .option('stdio', {
        default: false,
        type: 'boolean',
    })
    .option('v', {
        alias: 'verbose',
        count: true,
        description: 'Enable Verbose messaging.  -v to see basic output, -vv to see detailed outpur, -vvv to se subprocess output',
    })
    .option('package-prefix', {
        default: 'packages',
        description: 'An alternative prefix to ${packagePrefix}/node_modules.  You can\'t change the node_modules part',
        type: 'string',
    })
    .fail((msg, err, yargs) => {
        // process.exit(1);
    })
    .argv;

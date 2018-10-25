#!/usr/bin/env node
/* istanbul ignore file */
require('yargs') // tslint:disable-line
    .help()
    .strict()
    .showHelpOnFail(true)
    .commandDir('commands')
    .demandCommand(1)
    .option('cache', {
        default: true,
        description: 'Use the command cache to prevent re-building of dependencies',
        type: 'boolean',
    })
    .option('stdio', {
        default: false,
        type: 'boolean',
    })
    .option('v', {
        alias: 'verbose',
        count: true,
        default: 1,
        description: 'Enable Verbose messaging.  -v to see basic output, -vv to see detailed outpur, -vvv to se subprocess output',
    })
    .option('q', {
        alias: 'quiet',
        default: 'false',
        type: 'boolean',
    })
    .option('package-prefix', {
        default: 'packages',
        description: 'An alternative prefix to ${packagePrefix}/node_modules.  You can\'t change the node_modules part',
        type: 'string',
    })
    .option('why', {
        default: 'false',
        description: 'Explains what files are out of date when determining cache invalidation',
        type: 'boolean',
    })
    .fail((msg, err, yargs) => {
        // process.exit(1);
    })
    .argv;

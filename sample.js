const argv = require('yargs').option('v', {
    description: 'be verbose',
    alias: 'verbose',
    type: 'boolean',
    default: false
}).argv;

console.log(argv)
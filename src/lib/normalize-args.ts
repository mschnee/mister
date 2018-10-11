import { Argv } from 'yargs';

export interface PossibleArgs extends Argv {
    verbose?: number;
    quiet?: boolean;
}

export default function normalizeArgs(args: PossibleArgs) {
    if (args.quiet) {
        args.verbose = 0;
    }
    return args;
}

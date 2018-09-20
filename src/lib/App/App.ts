import { SpawnOptions } from 'child_process';
import * as path from 'path';

import chalk from 'chalk';
import { sync as rimraf } from 'rimraf';
import { Argv } from 'yargs';

import moveFile from '../move-file';
import wrap from '../output/wrap';
import runProcess from '../run-process';
import npmTgzToZip from '../stream/npm-tgz-to-zip';

import PackageCache from '../PackageCache';
import PackageManager from '../PackageManager';

export interface AppOptions {
    writeCache: boolean;
}

export default class App {
    private args: Argv;
    private writeCache: boolean;
    private verbosity: number;
    private packageManager: PackageManager;
    private packageCache: PackageCache;

    constructor(args: Argv, options?: AppOptions) {
        this.args = args;
        this.verbosity = this.args.verbose || 0;
        this.writeCache = options && options.writeCache || true;

        this.packageManager = new PackageManager({
            packagePrefix: args.packagePrefix || 'packages',
            verbosity: this.args.v || 0,
        });
        this.packageCache = new PackageCache(this.packageManager);
    }

    public doCommand() {
        if (this.args['with-dependencies']) {
            return this.doCommandWithDependencies();
        } else {
            return this.doCommandWithoutDependencies();
        }
    }

    public doCommandWithoutDependencies() {
        return this.doTasksOnAll(this.packageManager.getPackagesForArgs(this.args));
    }

    public doCommandWithDependencies() {
        const packageOrder = this.packageManager
            .getDependencyGraph(this.packageManager.getPackagesForArgs(this.args))
            .overallOrder();

        return this.doTasksOnAll(packageOrder);
    }

    public doCommandOnAll() {
        return this.doTasksOnAll(this.packageManager.getFullDependencyGraph().overallOrder());
    }

    public packCommand() {
        const mrjson = this.packageManager.getMonorepoPjson();
        const manifestFile = {
            packages: {},
            version:  mrjson.version,
        };
        const packageOrder = this.packageManager.getDependencyGraph(this.packageManager.getPackagesForArgs(this.args)).overallOrder();


        return packageOrder.reduce((accum, packageName) => {
            return accum.then(() => this.packageManager.verifyPackageName(packageName))
                .then( () => {
                    const newPjson = this.packageManager.getUpdatedPjsonForDist(packageName);
                    this.packageManager.writePackagePjson(this.args, packageName, newPjson);
                    rimraf(path.join(this.packageManager.getPackageDir(packageName), 'node_modules'));
                })
                .then(() => {
                    if (this.verbosity >= 1) {
                        /* tslint:disable-next-line */
                        console.log(wrap('[]', 'mister pack'), packageName);
                    }
                })
                .then(() => this.packageManager.preparePackage(packageName))
                .then(() => this.packageManager.runPackageProcess(this.args, packageName, 'npm', ['install', '--production', '--skip-package-lock']))
                .then(() => this.packageManager.runPackageProcess(this.args, packageName, 'npm', ['pack']))
                .then(() => {
                    manifestFile.packages[packageName] = {
                        tgzFileName: this.packageManager.getPackageDistFileName(packageName),
                        tgzFilePath: this.packageManager.resolveDistfileLocation(packageName),
                    };
                    return  moveFile(
                        this.args,
                        path.join(this.packageManager.getPackageDir(packageName), this.packageManager.getPackageDistFileName(packageName)),
                        this.packageManager.resolveDistfileLocation(packageName),
                    );
                })
                .then(() => {
                    if (this.verbosity >= 1) {
                        /* tslint:disable-next-line */
                        console.log(wrap('[]', 'mister pack'), 'created', chalk.bold.green(this.packageManager.resolveDistfileLocation(packageName)));
                    }
                    this.packageCache.writeTimestampForCommand(packageName, 'pack')
                })
                .then(() => this.packageManager.restorePackagePjson(this.args, packageName))
                .then(() => rimraf(path.join(this.packageManager.getPackageDir(packageName), 'node_modules')))
                .catch((e: Error) => {
                    /* tslint:disable-next-line */
                    console.error(wrap('[]', 'mister pack', chalk.bold.red), e)
                    this.packageManager.restorePackagePjson(this.args, packageName);
                    throw e;
                });
        }, Promise.resolve()).then(() => manifestFile);
    }


    public doTask(packageName: string, taskName: string) {
        const packageDir = this.packageManager.getPackageDir(packageName);

        const spawnOptions: SpawnOptions = {
            cwd: packageDir,
            env: Object.assign({}, process.env),
        };

        const localBin = path.join(process.cwd(), 'node_modules', '.bin');
        /* istanbul ignore next */
        if (process.env.hasOwnProperty('PATH')) {
            spawnOptions.env.PATH = `${process.env.PATH}${path.delimiter}${localBin}`;
        }

        // This sometimes happens on Windows:
        /* istanbul ignore next */
        if (process.env.hasOwnProperty('Path')) {
            spawnOptions.env.Path = `${process.env.Path}${path.delimiter}${localBin}`;
        }

        if (this.args.verbose >= 2) {
            /* tslint:disable-next-line */
            console.log(wrap('[]', 'do-task', chalk.yellow), 'running', chalk.bold(taskName), 'on', chalk.bold(packageName));
        }

        try {
            return runProcess('npm', ['run', taskName], spawnOptions, this.args);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    public doTasksOnAll(packages: string[]) {
        return packages.reduce((accum, packageName) => {
            const tasks  = this.packageManager.getMatchingPackageTasks(packageName, this.args.tasks || this.args._)
            return tasks.reduce((a: any, task) => {
                return a.then( () => {
                    return this.doTask(packageName, task);
                }); }
            ,accum);
        }, Promise.resolve());
    }

    public zipCommand() {
        return this.packCommand().then(() => {
            return Promise.all(this.packageManager.getPackagesForArgs(this.args).map((packageName) => this.zipLocalPackage(packageName).then((zipName) => {

                    if (this.verbosity >= 1) {
                        /* tslint:disable-next-line */
                        console.log(wrap('[]', 'mister zip'), 'created', chalk.bold.green(zipName));
                    }
                    this.packageCache.writeTimestampForCommand(packageName, 'zip')

            })));
        });
    }

    public async zipLocalPackage(packageName) {
        const tgzFile = this.packageManager.resolveDistfileLocation(packageName);
        const shortName = path.basename(tgzFile, '.tgz') + '.zip';
        const zipFile = path.join(path.dirname(tgzFile), shortName);
        await npmTgzToZip(tgzFile, zipFile);
        return shortName;
    }
}

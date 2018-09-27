import { SpawnOptions } from 'child_process';
import * as fs from 'fs';
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
    private force: boolean;
    private writeCache: boolean;
    private checkCommandCache: boolean;
    private verbosity: number;
    private packageManager: PackageManager;
    private packageCache: PackageCache;

    constructor(args: Argv, options?: AppOptions) {
        this.args = args;
        this.verbosity = this.args.verbose || 0;
        this.writeCache = options && options.writeCache || true;
        this.checkCommandCache = !!args.cache;
        this.force = !!args.force;

        this.packageManager = new PackageManager({
            packagePrefix: args.packagePrefix || 'packages',
            verbosity: this.args.v || 0,
        });
        this.packageCache = new PackageCache(this.packageManager, {verbosity: this.verbosity});
    }

    public cleanCommand() {
        this.packageCache.resetCache();
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
            return accum.then(async () => {
                const packageDir = this.packageManager.getPackageDir(packageName);
                const distFileName = this.packageManager.getPackageDistFileName(packageName);
                const distFileLocation = this.packageManager.resolveDistfileLocation(packageName);

                // do I need to build ?
                if (!this.force && this.checkCommandCache) {
                    if (fs.existsSync(distFileLocation) && this.packageCache.isPackageCommandUpToDate(packageName, 'pack')) {
                        return;
                    }
                }

                // othersie, time to package
                await this.packageManager.verifyPackageName(packageName);
                const newPjson = this.packageManager.getUpdatedPjsonForDist(packageName);
                this.packageManager.writePackagePjson(this.args, packageName, newPjson);
                rimraf(path.join(packageDir, 'node_modules'));

                if (this.verbosity >= 1) {
                    /* tslint:disable-next-line */
                    console.log(wrap('[]', 'mister pack'), packageName);
                }

                await this.packageManager.preparePackage(packageName);
                await this.packageManager.runPackageProcess(this.args, packageName, 'npm', ['install', '--production', '--skip-package-lock']);
                await this.packageManager.runPackageProcess(this.args, packageName, 'npm', ['pack']);
                manifestFile.packages[packageName] = {
                    tgzFileName: distFileName,
                    tgzFilePath: distFileLocation,
                };
                await moveFile(
                    this.args,
                    path.join(packageDir, distFileName),
                    distFileLocation,
                );

                if (this.verbosity >= 1) {
                    /* tslint:disable-next-line */
                    console.log(wrap('[]', 'mister pack'), 'created', chalk.bold.green(distFileLocation));
                }
                this.packageCache.writeTimestampForCommand(packageName, 'pack')

                this.packageManager.restorePackagePjson(this.args, packageName);
                rimraf(path.join(packageDir, 'node_modules'));
            }).catch((e: Error) => {
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
                return a.then(async () => {
                    const realTask = task.replace(/^\!/, '');
                    const checkCache = task.substring(0, 1) === '!';
                    if (checkCache) {
                        if (this.packageCache.isPackageTaskUpToDate(packageName, realTask)) {
                            return;
                        } else {
                            await this.doTask(packageName, realTask);
                            this.packageCache.writeTimestampForTask(packageName, realTask);
                        }
                    } else {
                        return this.doTask(packageName, realTask);
                    }
                }); }
            ,accum);
        }, Promise.resolve());
    }

    public zipCommand() {
        return this.packCommand().then(() => {
            return Promise.all(this.packageManager.getPackagesForArgs(this.args)
                .map((packageName) => this.zipLocalPackage(packageName)
            ));
        });
    }

    public async zipLocalPackage(packageName) {
        const tgzFile = this.packageManager.resolveDistfileLocation(packageName);
        const shortName = path.basename(tgzFile, '.tgz') + '.zip';
        const zipFile = path.join(path.dirname(tgzFile), shortName);

        if (!this.force && this.checkCommandCache) {
            if (fs.existsSync(zipFile) && this.packageCache.isPackageCommandUpToDate(packageName, 'zip')) {
                return;
            }
        }
        await npmTgzToZip(tgzFile, zipFile);

        if (this.verbosity >= 1) {
            /* tslint:disable-next-line */
            console.log(wrap('[]', 'mister zip'), 'created', chalk.bold.green(shortName));
        }
        this.packageCache.writeTimestampForCommand(packageName, 'zip');
    }
}

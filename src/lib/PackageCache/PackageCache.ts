import * as fs from 'fs';
import { EOL } from 'os';
import * as path from 'path';

import chalk from 'chalk';
import * as filteredGlob from 'glob-gitignore';

import wrap from '../output/wrap';
import PackageManager from '../PackageManager/PackageManager';

export interface PackageCacheOptions {
    verbosity?: number;
    why?: boolean;
}
export interface BuildCache {
    version: string;
    packages: {
        [packageName: string]: BuildCacheEntry;
    };
}

export interface CommandTimestamps {
    [commandName: string]: Date | string;
}
export interface BuildCacheEntry {
    commandTimestamps?: CommandTimestamps;
    taskTimestamps?: CommandTimestamps;
    commandHashes?: {
        [packageName: string]: string;
    };
    dependencies?: {
        [packageName: string]: {
            commandTimestamps?: CommandTimestamps;
            taskTimestamps?: CommandTimestamps;
        };
    };
}

export default class PackageCache {
    private packageManager: PackageManager;
    private verbosity: number;
    private cacheFilePath: string;
    private why: boolean = false;

    // caches
    private buildCache: BuildCache = null;

    constructor(manager: PackageManager, options?: PackageCacheOptions) {
        this.packageManager = manager;
        this.verbosity = (options && options.verbosity) || 0;
        this.why = (options && options.why);
        this.cacheFilePath = path.resolve(
            process.cwd(),
            '.mister',
            'cache.json'
        );
    }

    public resetCache() {
        this.buildCache = null;
        this.flushFile({});
    }

    public doesPackageEntryExist(packageName: string) {
        const cache = this.getCache();
        return (
            cache.hasOwnProperty('packages') &&
            cache.packages.hasOwnProperty(packageName)
        );
    }

    public doesCommandTimestampExist(packageName: string, commandName: string) {
        return this.doesThingTimestampExist(
            packageName,
            'command',
            commandName
        );
    }

    /**
     * uses npm-packlist logic to get all files that could be packed,
     * and returns a checksum.  Run this after a command to compute a state,
     * and then before the next invocation of that command to determine if
     * content on disk is different.
     *
     * TLDR:
     * If you run a build, but delete your build output, this is another way to test
     * that in code.
     */
    // public getFilesArrayHash(packageName) {
    //     const pjson = this.packageManager.getPackagePjson(packageName);
    //     const packagePath = this.packageManager.getPackageDir(packageName);

    //     if (pjson.files && Array.isArray(pjson.files)) {
    //         const ignore = pjson.files.reduce((p, file) => {
    //             p.push(`!${file}`);
    //             p.push(`!${file.replace(/\/+$/, '')}/**`)
    //         }, ['*']);
    //         const filesToCheck: string[] = filteredGlob.sync("**", {
    //             cwd: packagePath,
    //             ignore
    //         });
    //         const hmac = createHmac('md5', '');
    //         filesToCheck.forEach(f => {
    //             hmac.update(fs.readFileSync(path.join(packagePath, f)))
    //         });
    //         return hmac.digest('base64');
    //     } else {
    //         return null;
    //     }
    // }

    public arePackageCommandDependenciesUpToDate(
        packageName: string,
        commandName: string
    ) {
        return this.arePackageThingDependenciesUpToDate(
            packageName,
            'command',
            commandName
        );
    }

    public arePackageThingDependenciesUpToDate(
        packageName: string,
        thing: string,
        thingName: string
    ) {

        const dependencies = this.packageManager.getPackageLocalDependencies(
            packageName
        );
        const key = `${thing}Timestamps`;
        const cache = this.getCache();

        // we aren't checking if the dependency is up to date- the build process tree does that.
        // we ARE checking if THIS package has a dependency that WAS updated.
        // the key cache.packages[packageName].dependencies[depName][commandName] refers to the timestamp
        // the dependency command succeeded as of the time the command was successful as well.
        return !dependencies.some(d => {
            if (this.verbosity >= 3) {
                // tslint:disable-next-line:no-console
                console.log(
                    wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                    'checking ' + d
                );
            }

            try {
                const currentTimestamp =
                    cache.packages[packageName][key][thingName];
                if (this.verbosity >= 3) {
                    // tslint:disable-next-line:no-console
                    console.log(
                        wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                        'Current Timestamp ' + currentTimestamp
                    );
                }
                if (!cache.packages.hasOwnProperty(d)) {
                    if (this.verbosity >= 3) {
                        // tslint:disable-next-line:no-console
                        console.log(
                            wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                            'cache has no entry for  ' + d
                        );
                    }
                    return true;
                }
                const depTimestamp = cache.packages[d][key][thingName];
                if (this.verbosity >= 3) {
                    // tslint:disable-next-line:no-console
                    console.log(
                        wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                        'Dep Timestamp ' + depTimestamp
                    );
                }

                const refTime =
                    cache.packages[packageName].dependencies[d][key][thingName];
                if (this.verbosity >= 3) {
                    // tslint:disable-next-line:no-console
                    console.log(
                        wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                        'Ref Timestamp ' + refTime
                    );
                }

                if (depTimestamp > refTime) {
                    if (this.why) {
                        // tslint:disable-next-line:no-console
                        console.log(
                            wrap(
                                '[]',
                                `${packageName}:${thing}:${thingName}`,
                                chalk.gray
                            ),
                            `dependency ${d} is newer than at last command.`
                        );
                    }
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                if (this.verbosity >= 3) {
                    // tslint:disable-next-line:no-console
                    console.log(
                        wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                        e
                    );
                }
                return true;
            }
        });
    }

    public getCache(): BuildCache {
        if (!this.buildCache) {
            try {
                if (fs.existsSync(this.cacheFilePath)) {
                    this.buildCache = JSON.parse(
                        fs.readFileSync(this.cacheFilePath, 'utf8')
                    );
                } else {
                    if (this.verbosity >= 3) {
                        // tslint:disable-next-line:no-console
                        console.log(
                            wrap('[]', 'mister', chalk.gray),
                            'cache file does not exist'
                        );
                    }
                    this.buildCache = {
                        packages: {},
                        version: '1.0.1'
                    };
                }
            } catch (e) {
                if (this.verbosity >= 2) {
                    // tslint:disable-next-line no-console
                    console.log(e);
                }
                this.buildCache = {
                    packages: {},
                    version: '1.0.1'
                };
            }
        }

        if (!this.buildCache.version) {
            // nevermind, start fresh
            return {
                packages: {},
                version: '1.0.1'
            };
        }

        if (this.buildCache.version === '1.0.0') {
            this.migrate_1_0_0__to__1_0_1();
        } else if (this.buildCache.version !== '1.0.1') {
            throw new Error(
                `No upgrade path from given cache version '${
                    this.buildCache.version
                }' to '1.0.1'`
            );
        }
        return this.buildCache;
    }

    public isPackageCommandUpToDate(packageName: string, commandName: string) {
        return this.isPackageThingUpToDate(packageName, 'command', commandName);
    }

    public isPackageTaskUpToDate(packageName: string, taskName: string) {
        return this.isPackageThingUpToDate(packageName, 'task', taskName);
    }

    public writeTimestampForCommand(
        packageName: string,
        packageCommand: string,
        timestamp?: Date
    ) {
        return this.writeTimestampForThing(
            packageName,
            'command',
            packageCommand,
            timestamp
        );
    }

    public writeTimestampForTask(
        packageName: string,
        taskName: string,
        timestamp?: Date
    ) {
        return this.writeTimestampForThing(
            packageName,
            'task',
            taskName,
            timestamp
        );
    }

    private flushFile(newCache) {
        if (!fs.existsSync(path.dirname(this.cacheFilePath))) {
            fs.mkdirSync(path.dirname(this.cacheFilePath));
        }
        if (this.verbosity >= 3) {
            // tslint:disable-next-line:no-console
            console.log(wrap('[]', 'mister', chalk.gray), 'writing cache file');
        }
        fs.writeFileSync(
            this.cacheFilePath,
            JSON.stringify(newCache, null, 2),
            'utf8'
        );
        this.buildCache = newCache;
    }

    private doesThingTimestampExist(
        packageName: string,
        thing: string,
        thingName: string
    ) {
        const key = `${thing}Timestamps`;
        const cache = this.getCache();
        return (
            this.doesPackageEntryExist(packageName) &&
            cache.packages.hasOwnProperty(packageName) &&
            cache.packages[packageName].hasOwnProperty(key) &&
            cache.packages[packageName][key].hasOwnProperty(thingName)
        );
    }

    private isPackageThingUpToDate(
        packageName: string,
        thing: string,
        thingName: string
    ) {
        if (this.verbosity >= 3) {
            // tslint:disable-next-line:no-console
            console.log(
                wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                'Checking if up to date'
            );
        }
        if (!this.doesThingTimestampExist(packageName, thing, thingName)) {
            if (this.verbosity) {
                // tslint:disable-next-line:no-console
                console.log(
                    wrap(
                        '[]',
                        `${packageName}:${thing}:${thingName}`,
                        chalk.gray
                    ),
                    'has no cache timestamp'
                );
            }
            return false;
        }

        if (this.verbosity >= 3) {
            // tslint:disable-next-line:no-console
            console.log(
                wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                'has a timestamp'
            );
        }

        if (
            !this.arePackageThingDependenciesUpToDate(
                packageName,
                thing,
                thingName
            )
        ) {
            if (this.verbosity >= 3) {
                // tslint:disable-next-line:no-console
                console.log(
                    wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                    'Dependencies are out of date'
                );
            }
            return false;
        }

        if (this.verbosity >= 3) {
            // tslint:disable-next-line:no-console
            console.log(
                wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                'Checking last success time'
            );
        }
        const key = `${thing}Timestamps`;
        const cache = this.getCache();
        const lastSuccessTime = new Date(
            cache.packages[packageName][key][thingName]
        );

        if (this.verbosity >= 3) {
            // tslint:disable-next-line:no-console
            console.log(
                wrap('[]', `${packageName}:${thing}:${thingName}`, chalk.gray),
                'last successful at ' + lastSuccessTime
            );
        }

        const packagePath = this.packageManager.getPackageDir(packageName);
        const gitIgnoreFile = path.join(packagePath, '.gitignore');

        let ignore = [];
        if (fs.existsSync(gitIgnoreFile)) {
            ignore = fs.readFileSync(gitIgnoreFile, 'utf8').split(EOL);
        }

        const filesToCheck: string[] = filteredGlob.sync('**', {
            cwd: packagePath,
            ignore
        });

        const result = !filesToCheck.some(f => {
            const stat = fs.statSync(path.join(packagePath, f));
            if (stat.isDirectory()) {
                return false;
            }
            if (stat.mtime >= lastSuccessTime) {
                if (this.why) {
                    // tslint:disable-next-line:no-console
                    console.log(
                        wrap(
                            '[]',
                            `${packageName}:${thing}:${thingName}`,
                            chalk.gray
                        ),
                        `${f} is newer than at last command.`
                    );
                }
                return true;
            } else {
                return false;
            }
        });

        if (this.verbosity) {
            if (result) {
                // tslint:disable-next-line:no-console
                console.log(
                    wrap(
                        '[]',
                        `${packageName}:${thing}:${thingName}`,
                        chalk.bold.green
                    ),
                    'is up to date'
                );
            } else {
                // tslint:disable-next-line:no-console
                console.log(
                    wrap(
                        '[]',
                        `${packageName}:${thing}:${thingName}`,
                        chalk.bold.yellow
                    ),
                    'is out of date'
                );
            }
        }
        return result;
    }

    private writeTimestampForThing(
        packageName: string,
        thing: string,
        thingName: string,
        timestamp?: Date
    ) {
        const time = timestamp || new Date();
        const cache = this.getCache();
        const key = `${thing}Timestamps`;
        if (!cache.hasOwnProperty('packages')) {
            cache.packages = {};
        }

        if (!cache.packages.hasOwnProperty(packageName)) {
            cache.packages[packageName] = {
                dependencies: {}
            };
        }

        if (!cache.packages[packageName].hasOwnProperty(key)) {
            cache.packages[packageName][key] = {};
        }

        cache.packages[packageName][key][thingName] = time;

        const dependencies = this.packageManager.getPackageLocalDependencies(
            packageName
        );

        dependencies.forEach(d => {
            if (!cache.packages[packageName].dependencies.hasOwnProperty(d)) {
                cache.packages[packageName].dependencies[d] = {};
            }
            if (
                !cache.packages[packageName].dependencies[d].hasOwnProperty(key)
            ) {
                cache.packages[packageName].dependencies[d][key] = {};
            }
            cache.packages[packageName].dependencies[d][key][thingName] = time;
        });
        this.flushFile(cache);
    }

    // Migrations

    private migrate_1_0_0__to__1_0_1() {
        if (this.verbosity) {
            // tslint:disable-next-line:no-console
            console.log(
                wrap('[]', 'mister', chalk.green),
                'migrating cache file from v1.0.0 to v1.0.1'
            );
        }
        // First, fix the keys
        Object.keys(this.buildCache.packages).forEach(p => {
            if (this.buildCache.packages[p].hasOwnProperty('dependencies')) {
                const newDeps = {};
                Object.keys(this.buildCache.packages[p].dependencies).forEach(
                    d => {
                        if (!newDeps.hasOwnProperty(d)) {
                            newDeps[d] = {
                                commandTimestamps: {},
                                taskTimestamps: {}
                            };
                        }
                        newDeps[d].commandTimestamps = this.buildCache.packages[
                            p
                        ].dependencies[d];
                    }
                );
                this.buildCache.packages[p].dependencies = newDeps;
            }
        });

        this.buildCache.version = '1.0.1';
        this.flushFile(this.buildCache);
    }
}

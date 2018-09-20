import * as fs from "fs";
import { EOL } from "os";
import * as path from "path";

import chalk from "chalk";
import * as filteredGlob from "glob-gitignore";

import wrap from "../output/wrap";
import PackageManager from "../PackageManager/PackageManager";

export interface PackageCacheOptions {
    verbosity?: number;
}
export interface BuildCache {
    version: string;
    packages: {
        [packageName: string]: BuildCacheEntry;
    };
}

export interface CommandTimestamps {
    [commandName: string]: Date;
}
export interface BuildCacheEntry {
    commandTimestamps?: CommandTimestamps;
    dependencies?: {
        [packageName: string]: CommandTimestamps;
    };
}

export default class PackageCache {
    private packageManager: PackageManager;
    private verbosity: number;
    private cacheFilePath: string;

    // caches
    private buildCache: BuildCache = null;

    constructor(manager: PackageManager, options?: PackageCacheOptions) {
        this.packageManager = manager;
        this.verbosity = (options && options.verbosity) || 0;

        this.cacheFilePath = path.resolve(process.cwd(), ".mister", "cache.json");
    }

    public resetCache() {
        this.buildCache = null;
        this.flushFile({});
    }

    public doesPackageEntryExist(packageName: string) {
        const cache = this.getCache();
        return (
            cache.hasOwnProperty("packages") &&
            cache.packages.hasOwnProperty(packageName)
        );
    }

    public doesCommandTimestampExist(packageName: string, commandName: string) {
        const cache = this.getCache();
        return (
            this.doesPackageEntryExist(packageName) &&
            cache.packages[packageName].commandTimestamps.hasOwnProperty(
                commandName
            )
        );
    }

    public arePackageCommandDependenciesUpToDate(
        packageName: string,
        commandName: string
    ) {
        const dependencies = this.packageManager.getPackageLocalDependencies(
            packageName
        );
        const cache = this.getCache();

        // we aren't checking if the dependency is up to date- the build process tree does that.
        // we ARE checking if THIS package has a dependency that WAS updated.
        // the key cache.packages[packageName].dependencies[depName][commandName] refers to the timestamp
        // the dependency command succeeded as of the time the command was successful as well.
        return !dependencies.some(d => {
            const currentTimestamp =
                cache.packages[packageName].commandTimestamps[commandName];
            const  depTimestamp =
                cache.packages[d].commandTimestamps[commandName];
            const refTime =
                cache.packages[packageName].dependencies[d][commandName];

            if (depTimestamp > refTime) {
                if (this.verbosity >= 2) {
                    // tslint:disable-next-line:no-console
                    console.log(
                        wrap("[]", "mister cache", chalk.gray) +
                            wrap(
                                "[]",
                                `${packageName}:${commandName}`,
                                chalk.gray
                            ),
                        `dependency ${d} is newer than at last command.`
                    );
                }
                return true;
            } else {
                return false;
            }
        });
    }

    public isPackageCommandUpToDate(packageName: string, commandName: string) {
        if (this.verbosity >= 3) {
            // tslint:disable-next-line:no-console
            console.log('Checking if', commandName, 'is up to date for', packageName)
        }
        if (!this.doesCommandTimestampExist(packageName, commandName)) {
            if (this.verbosity >= 2) {
                // tslint:disable-next-line:no-console
                console.log(
                    wrap("[]", "mister cache", chalk.gray) +
                        wrap("[]", commandName, chalk.gray),
                    "has no build timestamp"
                );
            }
            return false;
        }

        if (
            !this.arePackageCommandDependenciesUpToDate(
                packageName,
                commandName
            )
        ) {
            return false;
        }

        const cache = this.getCache();
        const lastSuccessTime = new Date(
            cache.packages[packageName].commandTimestamps[commandName]
        );

        const packagePath = this.packageManager.getPackageDir(packageName);
        const gitIgnoreFile = path.join(packagePath, ".gitignore");

        let ignore = [];
        if (fs.existsSync(gitIgnoreFile)) {
            ignore = fs.readFileSync(gitIgnoreFile, "utf8").split(EOL);
        }

        const filesToCheck: string[] = filteredGlob.sync("**", {
            cwd: packagePath,
            ignore
        });

        const result = !filesToCheck.some(f => {
            const stat = fs.statSync(path.join(packagePath, f));
            if (stat.isDirectory()) {
                return false;
            }
            if (stat.mtime >= lastSuccessTime) {
                if (this.verbosity >= 2) {
                    // tslint:disable-next-line:no-console
                    console.log(
                        f,
                        "is out of date",
                        stat.mtime,
                        lastSuccessTime
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
                    wrap("[]", "mister cache", chalk.bold.green) +
                        wrap("[]", commandName, chalk.green),
                    packageName,
                    "is up to date"
                );
            } else {
                // tslint:disable-next-line:no-console
                console.log(
                    wrap("[]", "mister cache", chalk.bold.yellow) +
                        wrap("[]", commandName, chalk.yellow),
                    packageName,
                    "is out of date"
                );
            }
        }
        return result;
    }

    public writeTimestampForCommand(
        packageName: string,
        packageCommand: string,
        timestamp?: Date
    ) {
        const time = timestamp || new Date();
        const cache = this.getCache();
        if (!cache.hasOwnProperty("packages")) {
            cache.packages = {};
        }

        if (!cache.packages.hasOwnProperty(packageName)) {
            cache.packages[packageName] = {
                commandTimestamps: {},
                dependencies: {}
            };
        }

        cache.packages[packageName].commandTimestamps[packageCommand] = time;

        const dependencies = this.packageManager.getPackageLocalDependencies(
            packageName
        );

        dependencies.forEach(d => {
            if (!cache.packages[packageName].dependencies.hasOwnProperty(d)) {
                cache.packages[packageName].dependencies[d] = {}
            }
            cache.packages[packageName].dependencies[d][packageCommand] = time;
        })
        this.flushFile(cache);
    }

    private flushFile(newCache) {
        if (!fs.existsSync(path.dirname(this.cacheFilePath))) {
            fs.mkdirSync(path.dirname(this.cacheFilePath));
        }
        fs.writeFileSync(
            this.cacheFilePath,
            JSON.stringify(newCache, null, 4),
            "utf8"
        );
        this.buildCache = newCache;
    }

    private getCache(): BuildCache {
        if (!this.buildCache) {
            try {
                if (fs.existsSync(this.cacheFilePath)) {
                    this.buildCache = JSON.parse(
                        fs.readFileSync(this.cacheFilePath, "utf8")
                    );
                } else {
                    if (this.verbosity >= 2) {
                        console.log(this.cacheFilePath, "does not exist"); // tslint:disable-line:no-console
                    }
                    this.buildCache = {
                        packages: {},
                        version: "1.0.0"
                    };
                }
            } catch (e) {
                if (this.verbosity >= 2) {
                    console.log(e); // tslint:disable-line:no-console
                }
                this.buildCache = {
                    packages: {},
                    version: "1.0.0"
                };
            }
        }

        return this.buildCache;
    }
}

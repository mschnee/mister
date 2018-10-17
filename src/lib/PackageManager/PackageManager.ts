import { SpawnOptions } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { DepGraph } from 'dependency-graph';
import * as nodeGlob from 'glob';
import { sync as rimraf } from 'rimraf';

import moveFile from '../move-file';
import runProcess from '../run-process';

export interface PackageManagerOptions {
    packagePrefix: string;
    verbosity?: number;
}

interface PackageJsonCache {
    [key: string]: {
        buffer: Buffer;
        atime: Date;
        mtime: Date;
    }
}

/* istanbul ignore next */
export interface PjsonDeps {
    [key: string]: string;
}

/* istanbul ignore next */
export interface PjsonFile {
    name: string;
    version: string;
    dependencies: PjsonDeps;
    devDependencies: PjsonDeps;
}

export default class PackageManager {

    // settings
    private packagePrefix: string;
    private distPrefix: string;
    private verbosity: number;

    // cached
    private localPackages: string[];
    private pjsonCache: PackageJsonCache = {};
    private pdirCache = {};
    private monorepopjsonCache: Buffer = null;

    private fullDepGraph;

    constructor(options?: PackageManagerOptions) {
        this.packagePrefix =
            options && options.packagePrefix
                ? path.resolve(process.cwd(), options.packagePrefix)
                : path.join(process.cwd(), "packages");

        this.distPrefix = path.join(process.cwd(), "dist");
        this.verbosity = options && options.verbosity || 0;
    }

    public getDependencyGraph(packages: string[]) {
        const dep = new DepGraph({circular: false});

        packages.forEach((packageName) => {
            dep.addNode(packageName);

            this.getPackageLocalDependencies(packageName).forEach((d) => {
                if (!dep.hasNode(d)) {
                    dep.addNode(d);
                }
                dep.addDependency(packageName, d);
            });
        });

        return dep;
    }

    public getFullDependencyGraph() {
        if (!this.fullDepGraph) {
            this.fullDepGraph = new DepGraph({circular: false});

            this.getLocalPackages().forEach((packageName) => {
                this.fullDepGraph.addNode(packageName);

                this.getPackageLocalDependencies(packageName).forEach((d) => {
                    if (!this.fullDepGraph.hasNode(d)) {
                        this.fullDepGraph.addNode(d);
                    }
                    this.fullDepGraph.addDependency(packageName, d);
                });
            });
        }

        return this.fullDepGraph;
    }

    public getLocalPackages() {
        // CWD needs to be scoped because mister frequently changes directories.
        const PWD = process.cwd();
        const pdir = path.join(this.packagePrefix, "node_modules");

        if (!this.localPackages) {
            const tlPackages = nodeGlob
                .sync("*", { cwd: pdir })
                .filter((m: string) => m.substring(0, 1) !== "@");

            const scopedPackages = nodeGlob.sync("@*/*", { cwd: pdir });

            this.localPackages = []
                .concat(tlPackages, scopedPackages)
                .filter(pn => {
                    //console.log(pdir, pn, 'package.json')
                    return fs.existsSync(path.join(pdir, pn, 'package.json'))
                });
        }

        return this.localPackages;
    }

    public getMatchingLocalPackages(packages?: string[]) {
        if (!packages) {
            return [];
        }
        const p = this.getLocalPackages();
        return p.filter((name) => packages.find((i) => i === name));
    }

    public getMatchingPackageTasks(packageName, tasks?: string[]) {
        // return this.getPackageTasks(packageName).filter((taskName) =>
        //     tasks.find((t) => t.replace(/^\!/, '') === taskName)
        // );
        return this.getPackageTasks(packageName).reduce((res, taskName) => {
            const found = tasks.find((t) => t.replace(/^\!/, '') === taskName);
            if (found) {
                res.push(found)
            }
            return res;
        }, []);
    }

    public getMonorepoPjson(): PjsonFile {
        if (!this.monorepopjsonCache) {
            const p = path.join(process.cwd(), "package.json");
            if (!fs.existsSync(p)) {
                throw new Error(
                    `Could not find a package.json file.  Are you in the right directory?`,
                );
            }
            this.monorepopjsonCache = fs.readFileSync(p);
        }

        try {
            return JSON.parse(this.monorepopjsonCache.toString());
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error("Error parsing monorepo package.json");
            throw e;
        }
    }

    public getPackageDir(packageName: string) {
        if (!packageName) {
            throw new Error("missing arguments");
        }
        if (!this.pdirCache.hasOwnProperty(packageName)) {
            this.pdirCache[packageName] = path.join(
                this.packagePrefix,
                "node_modules",
                packageName,
            );
        }
        return this.pdirCache[packageName];
    }

    public getPackageDistDependencies(packageName: string) {
        const localPackages = this.getLocalPackages();
        const pjson = this.getPackagePjson(packageName);
        const mrjson = this.getMonorepoPjson();

        const pnames = (pjson.bundledDependencies || []).concat(
            pjson.bundleDependencies || [],
        );
        return pnames.reduce((accum, depName) => {
            // if we need to bundle a local dependency, we need the absolute path to it's it's tarball.
            if (localPackages.indexOf(depName) >= 0) {
                accum[depName] = path.relative(
                    this.getPackageDir(packageName),
                    this.resolveDistfileLocation(depName),
                );
            } else if (!mrjson.dependencies.hasOwnProperty(depName)) {
                throw new Error(
                    `Monorepo package.json is missing '${depName}' from dependencies, requested by package '${packageName}'`,
                );
            } else {
                accum[depName] = mrjson.dependencies[depName];
            }

            return accum;
        }, {});
    }

    public getPackageDistFileName(packageName) {
        const mrjson = this.getMonorepoPjson();

        // see https://github.com/npm/cli/blob/latest/lib/pack.js
        const name =
            packageName[0] === "@"
                ? packageName.substr(1).replace(/\//g, "-")
                : packageName;

        return `${name}-${mrjson.version}.tgz`;
    }

    public getPackageLocalDependencies(packageName) {
        const pjson = this.getPackagePjson(packageName);

        return Object.keys(pjson.dependencies || {})
            .concat(Object.keys(pjson.devDependencies || {}))
            .filter((d) => !!this.getLocalPackages().find((l) => d === l));
    }

    public getPackagePjson(packageName: string) {
        if (!this.pjsonCache.hasOwnProperty(packageName)) {
            const p = path.join(this.getPackageDir(packageName), "package.json");
            if (!fs.existsSync(p)) {
                throw new Error(
                    `Package ${packageName} does not have a package.json file`,
                );
            }
            const fstat = fs.statSync(p);
            const fbuf = fs.readFileSync(p);
            this.pjsonCache[packageName] = {
                atime: fstat.atime,
                buffer: fbuf,
                mtime: fstat.mtime
            }
        }

        try {
            return JSON.parse(this.pjsonCache[packageName].buffer.toString());
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error("Error parsing package.json for", packageName);
            throw e;
        }
    }

    public getPackageTasks(packageName: string): string[] {
        const pjson = this.getPackagePjson(packageName);
        if (pjson.hasOwnProperty("scripts")) {
            return Object.keys(pjson.scripts);
        } else {
            return [];
        }
    }

    public getPackagesForArgs(argv) {
        if (argv.all) {
            return this.getLocalPackages();
        } else if (argv.packages) {
            return this.getMatchingLocalPackages(argv.packages);
        } else {
            throw new Error("No Packages supplied.  Did you mean to use --all?");
        }
    }

    public getUpdatedPjsonForDist(packageName: string) {
        const pjson = this.getPackagePjson(packageName);
        const mrjson = this.getMonorepoPjson();
        const nd = this.getPackageDistDependencies(packageName);

        delete pjson.dependencies;
        delete pjson.devDependencies;

        pjson.version = mrjson.version;
        pjson.dependencies = nd;
        return pjson;
    }

    public preparePackage(packageName) {
        const dir = this.getPackageDir(packageName);
        rimraf(path.join(dir, "node_modules"));
        rimraf(path.join(dir, "package-lock.json"));
    }

    public resolveDistfileLocation(packageName) {
        return path.join(this.distPrefix, this.getPackageDistFileName(packageName));
    }

    public async runPackageProcess(argv: any, packageName: string, command: string, args: string[]) {
        const packageDir = this.getPackageDir(packageName);
        const spawnOptions: SpawnOptions = {
            cwd: packageDir,
            env: Object.assign({}, {
                MISTER_PACKAGE: packageName,
                MISTER_PACKAGE_PATH: packageDir,
                MISTER_ROOT: path.resolve(process.cwd()),
            }, process.env),
        };

        /* istanbul ignore if */
        if (argv.verbose >= 2) {
            console.log(`[${packageName}] run-process (${packageDir}) ${command} ${args.join(' ')}`); // tslint:disable-line
        }

        const localBin = path.join(process.cwd(), 'node_modules', '.bin');
        if (process.env.hasOwnProperty('PATH')) {
            spawnOptions.env.PATH = `${process.env.PATH}${path.delimiter}${localBin}`;
        }

        // This sometimes happens on Windows:
        if (process.env.hasOwnProperty('Path')) {
            spawnOptions.env.Path = `${process.env.Path}${path.delimiter}${localBin}`;
        }

        return runProcess(command, args, spawnOptions, argv);
    }

    /**
     * Restores the content, atime, and mtime of package.json
     */
    public restorePackagePjson(argv, packageName: string) {
        /* istanbul ignore else */
        if (this.pjsonCache.hasOwnProperty(packageName)) {
            const p = path.join(this.getPackageDir(packageName), "package.json");
            /* istanbul ignore if */
            if (argv["debug-persist-package-json"]) {
                return moveFile(
                    argv,
                    p,
                    path.join(this.getPackageDir(packageName), "package-debug.json"),
                ).then(() => {
                    fs.writeFileSync(p, this.pjsonCache[packageName].buffer);
                });
            } else {
                fs.writeFileSync(p, this.pjsonCache[packageName].buffer);
            }

            // restore the atime/mtime of the file.
            fs.utimesSync(p, this.pjsonCache[packageName].atime, this.pjsonCache[packageName].mtime);
        }
    }

    public async verifyPackageName(packageName) {
        const pjson = this.getPackagePjson(packageName);
        if (pjson.name !== packageName) {
            throw new Error(`Name mismatch between directory '${packageName}' and package.json name ${pjson.name}`);
        }
    }

    public writePackagePjson(argv, packageName, pjson) {
        // ensure the original buffer is cached
        this.getPackagePjson(packageName);

        /* istanbul ignore if */
        if (argv.verbose >= 2) {
            console.log('Writing temp package.json for', packageName); // tslint:disable-line
        }

        const p = path.join(this.getPackageDir(packageName), 'package.json');
        fs.writeFileSync(p, JSON.stringify(pjson, null, 4));
    }

}

# 1.0.0
First Published version.
- Adds `mister do [package1, package1, ..packageN] --tasks <task1, task2, ...taskN>`
  - This is the low level npm script runner.  All tasks named will be run on all packages named, provided the package exists and the package has a script with the given name.
  - Because dependency and command tracking has not been implemented yet, `1.0.0` will not write `.mister/build.json`.

Known issues:
- At runtime, some npm modules (such as `app-root-dir`) can get confused and return an incorrect path when a monorepo package is run via `mister`.
- Some npm modules (such as `uglify-webpack-plugin`) assume ownership of a folder under package-local `node_modules`, can write files there, and break module resolution on subsequent commands.

### 1.0.1
- Spellcheck the `README.md`, and thank [`@a-z`](https://www.npmjs.com/~a-z) for being awesome and freeing up the name `mister`.

### 1.0.2
- Updates [README](./README.md) with a ts-node solution.
- Pipe sub-process output to stdout/stderr instead of `console.log`

## 1.1.0
Adds basic dependency resolution.  If you packages depend on other packages, it will attempt to build them in order.
```
mister do [package1, package2, ...packageN] --with-dependencies --tasks <task1, task2, ...taskN>
```

This is a simple extension of `mister do`.  As an example, if `package3` depends on `package1` which depends on `package1`, then `mister do package1 -d --tasks build` will run `build` on `package1`, `package2`, and then `package3`.

- Adds the command `do-all`, as in `mister do-all [task1, task2, ...taskN]`, which performs the tasks on all your packages in correct order of dependency.
- Adds the `--all` flag to `do`, as in `mister do --all --tasks task1 task2 taskN`, which is synonymous to `mister do-all task1 task2 taskN`
- Adds the `--with-dependencies` or `-d` flag to `do`, as in `mister do -d package3 --tasks task1 task2`, which would run `task1` and `task2` on `package3` after running them on all of its dependencies.

## 1.2.0
Adds `mister pack` for creating packages that honor bundledDependencies.

This will also package the local dependencies, since they need to be packaged first if they are bundledDependencies of dependent package.

```
mister pack [package1, package2, packageN]
```

- Adds the command `mister pack`
- Switches tests from `mocha` to `ava`, due to the use of `process.chdir()` to contextualize tests in fixture folders.
- Removes a lot of switches necessary to make `mocha` testing work, which `ava` does not require.

## 1.3.0
Adds `mister zip` for creating zip file distributions, for AWS, Azure, or wherever you want.

This is based off of `mister pack` and will include all local and external `bundledDependencies`, however only the packages you specify will be zipped.

```
mister zip package3 @scope/package2
```
Will create
```
./dist/package3-1.0.0.zip
./dist/scope-package2-1.0.0.zip
```

## 1.4.0
Implements `--cache=true` for `mister pack` and `mister zip`.  You can always `--no-cache` to force full repackaging and re-zipping.
Fixes `zip` functionality.  It was creating empty files, now they have content.

Under the hood, there's a significant refactor of the package functions into a PackageManager class.  There will be more cleanup in the future.

### 1.4.1
Fixes a bug in writing the cache file dependencies.

## 1.5.0
- Implements caching on all tasks passed to `do` and `do-all`
- Implements caching on `pack` and `zip` commands.

Task caching can be skipped with a bang: `mister do-all clean build !test !coverage`

- Cleaned up logging a bit.

### 1.5.1
- mister no longer throws an exception if a package in the list is missing a `package.json` file.

### 1.5.2
- Bugfix: change behavior of `do`.
- Bugfix: change `--with-dependencies` to `--no-dependencies`;

### 1.5.3
- Adds `--why`, which will explain why your cache is considered invalid.

### 1.5.4
- Fixes cache bugs that can arise when dependency tasks fail.

### 1.5.5
- Super performance increase across both time and space: `pack` commands perform `npm install --offline`.
- Removes superfluous logging.pac

### 1.5.6
- `npm install --prefer-offline` because some things like circlci have problems with offline caches.
# 1.0.0
First Published version.
- Adds `mister do [package1, package1, ..packageN] --tasks <task1, task2, ...taskN>`
  - This is the low level npm script runner.  All tasks named will be run on all packages named, provided the package exists and the package has a script with the given name.
  - Because dependency and command tracking has not been implemented yet, `1.0.0` will not write `.mister/build.json`.

Known issues:
- At runtime, some npm modules (such as `app-root-dir`) can get confused and return an incorrect path when a monorepo package is run via `mister`.
- Some npm modules (such as `uglify-webpack-plugin`) assume ownership of a folder under package-local `node_modules`, can write files there, and break module resolution on subsequent commands.

## 1.0.1
- Spellcheck the `README.md`, and thank [`@a-z`](https://www.npmjs.com/~a-z) for being awesome and freeing up the name `mister`.

## 1.0.2
- Updates [README](./README.md) with a ts-node solution.
- Pipe sub-process output to stdout/stderr instead of `console.log`

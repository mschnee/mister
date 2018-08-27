# MonoRepository build tools

[![Build Status](https://travis-ci.org/mschnee/mister.svg?branch=master)](https://travis-ci.org/mschnee/mister)
[![Test Coverage](https://api.codeclimate.com/v1/badges/17d688f89336cb34595a/test_coverage)](https://codeclimate.com/github/mschnee/mister/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/17d688f89336cb34595a/maintainability)](https://codeclimate.com/github/mschnee/mister/maintainability)
[![dependencies Status](https://david-dm.org/mschnee/mister/status.svg)](https://david-dm.org/mschnee/mister)
[![devDependencies Status](https://david-dm.org/mschnee/mister/dev-status.svg)](https://david-dm.org/mschnee/mister?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/mschnee/mister/badge.svg?targetFile=package.json)](https://snyk.io/test/github/mschnee/mister?targetFile=package.json)

Mono-Repository -> M.R. -> Mr. -> Mister

**mister** is a set of commands that can super-simplify running tasks on a monorepository.

## Mister...
- **is** a set of commands to simplify running tasks on packages in a monorepository.
- **is not** a build system or toolchain.
- **does not** require initialization, changes to your `package.json`.
- **does not** create symlinks, or magic fake relative packages with relative path imports, or anything else.
- **may** create one single file, `.mister/build.json`, to help prevent re-building packages that have not changed.

Finally, **mister is not necessary**.  Everything mister does, you could do yourself, albeit much more tediously, if you use a similar folder structure.

**mister** may not be the right tool for you.  There are plenty of monorepo systems available, from `yarn workspaces`, to `lerna`, and `bit`.  Consult your programmers if `mister` runs longer than 4 hours.

## So how do I use it?

Mister's only real requirement is that your monorepository packages are in the folder `packages/node_modules`.
```sh
.
├── .mister             # You should .gitignore this if it gets created.
│   └── build.json      # This is the file MR uses to keep track of build timestamps and dependencies.
├── node_modules        # This is where you put your external dependencies.
│   ├── express
│   └── underscore
└── packages
    └── node_modules    # These are the packages of your monorepository.
        ├── @scope
        │   ├── package1
        │   └── package2
        ├── package3
        └── package4

```

Now, you can have `mister do` some things for you:
```sh
mister do @scope/package4 --tasks clean test build
```

## How do I make packages?
`mister` comes with a `pack` command, which honors `bundledDependencies`.

```sh
mister pack @scope/package2 package1
```

Note that due to `npm pack` not following symlinks or doing any module resolution at all (it assumes everything is in relative `node_modules`), `mister` will perform `npm install --production` for all local package dependencies, and rename package-local dependency versions in `package.json` with the relative file path to the dependency tarball.  Upon completion, all changes are reverted (the only side effects are tarballs in `./dist`).

This process can be time-consuming.

`mister pack` is a primitive that only creates packages.  You will need to build them first e.g. `mister do packageName --tasks build && mister pack packageName`


## Reference
<table>
    <thead>
        <td colspan="3">
        <h3>do</h3>
        <pre>mister do [packages...] --tasks [tasks...] <options></pre>
        </td>
    </thead>
    <tr>
        <td>Required</td>
        <td/>
        <td/>
    </tr>
    <tr>
        <td/>
        <td><code>--tasks</code></td>
        <td>The list of tasks to run on each package, if that package has a given task</td>
    </tr>
    <tr>
        <td>Optional</td>
        <td/>
        <td/>
    </tr>
        <td/>
        <td><code>packages</code></td>
        <td>The list of packages to run the tasks against - required unless <code>--all</code> is set</td>
    </tr>
    <tr>
        <td/>
        <td><code>--all</code></td>
        <td>Runs tasks on all packages, in order of dependencies</td>
    </tr>
    <tr>
        <td/>
        <td><code>--dependencies</code></td>
        <td>Includes all dependencies of the provided packages</td>
    </tr>
    <tr>
        <td/>
        <td><code>--verbose</code></td>
        <td>Pipes <code>stdout</code> and <code>stderr</code> from the subprocesses</td>
    </tr>
</table>
<table>
    <thead>
        <td colspan="3">
            <h3>do-all</h3>
            <pre>mister do-all [tasks...] <options></pre>
        </td>
    </thead>
    <tr>
        <td>Required</td>
        <td/>
        <td/>
    </tr>
    <tr>
        <td></td>
        <td><code>tasks</code></td>
        <td>Performs the tasks against all packages in dependency order</td>
    </tr>
    <tr>
        <td/>
        <td><code>--verbose</code></td>
        <td>Pipes <code>stdout</code> and <code>stderr</code> from the subprocesses</td>
    </tr>
</table>
<table>
    <thead>
        <td colspan="3">
            <h3>pack</h3>
            <pre>mister pack [packages...] <options></pre>
        </td>
    </thead>
    <tr>
        <td>Required</td>
        <td/>
        <td/>
    </tr>
    <tr>
        <td></td>
        <td><code>packages</code></td>
        <td>Runs <code>npm pack</code> on the given packages and their dependencies.  This honors <code>bundledDependencies</code>, and will include them (including your packages and their dependencies).</td>
    </tr>
    <tr>
        <td/>
        <td><code>--verbose</code></td>
        <td>Pipes <code>stdout</code> and <code>stderr</code> from the subprocesses</td>
    </tr>
</table>


## Any other recommendations?

To take advantage of not having multiple dependency versions, you'll want to install all your dependencies at the top level (but you will still need to reference those dependencies in the `package.json` files of your packages).  *But you don't have to do that if you don't want to*.  Managing your dependencies is up to you ;)

## How does this even work?

It helps to read up on how [node resolves module names](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders).  The TLDR version is that, given `require('module-name')`, node will essentially walk up the filesystem until it discoveres a path matching `node_modules/module-name`.

Using `package/node_modules` to structure your monorepository means you can leverage this to `require('your-monorepository-package')` from inside of any other monorepository package, and also let you `require('external-dependency')` installed to your top-level `node_modules` folder.

## Caveats

### `node_modules` is Ignored
Several tools, like `ts-node`, by default ignore `node_modules`, which means they do not work as expected in `packages/node_modules`.  If you have written tests in typescript, you will need to pass an updated `TS_NODE_IGNORE` environment variable either through your top-level script or your package-level script:
```json
{
    "scripts": {
        "test": "cross-env TS_NODE_IGNORE=\"/(?<!packages\/)node_modules/\" nyc mocha",
    }
}
```

### Incorrect Paths
A number of modules, like `app-root-dir`, make assumptions about where they are located and can return incorrect path results.

### Greedy Dependencies
Even worse, some like `uglifyjs-webpack-plugin` can break your builds because they will write files assuming they have ownership of the package-local `node_modules` entry, creating directories and files that don't actually exist, and breaking subsequent runs.

Given this simplified structure:
```sh
.
├── node_modules
│   └── uglifyjs-webpack-plugin         # The first time, require('uglifyjs-webpack-plugin') resolves here
│       └── index.js
└── packages
    └── node_modules
        └── monorepo-package
```

Running webpack will create the file `./packages/node_modules/monorepo-package/node_modules/uglify-webpack-plugin/.cache`
```sh
.
├── node_modules
│   └── uglifyjs-webpack-plugin             # This is where the module really is!
│       └── index.js
└── packages
    └── node_modules
        └── monorepo-package
            └── node_modules
                └── uglifyjs-webpack-plugin  # but require('uglifyjs-webpack-plugin') will now resolve this!!
                    └── .cache
```

The next time you build, node will resolve `require('uglify-webpack-plugin')` to that that folder instead.  That folder only has the cache file, the require will throw an error, and your build will fail.

# Features in Active Development
- Use `.mister/build.json` to track which packages have been successfully built, so that larger projects with multiple packages don't have to rebuild them.  See [this issue](https://github.com/mschnee/mister/issues/4)
- Create a `mister pack` command that honors `bundledDependencies`.  See [this issue](https://github.com/mschnee/mister/issues/5).
- Create a `mister pack --type=zip` variant that can be used to create zip files that include shared packages for deployment in AWS Lambda.  See [this issue](https://github.com/mschnee/mister/issues/6).

# Thanks
A huge thanks to [`@a-z`](https://www.npmjs.com/~a-z) for agreeing to free up the name `mister`.

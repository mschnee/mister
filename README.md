MonoRepository build tools
==========================
[![Build Status](https://travis-ci.org/mschnee/mister.svg?branch=master)](https://travis-ci.org/mschnee/mister)
[![Coverage Status](https://coveralls.io/repos/github/mschnee/mister/badge.svg)](https://coveralls.io/github/mschnee/mister)
[![Maintainability](https://api.codeclimate.com/v1/badges/17d688f89336cb34595a/maintainability)](https://codeclimate.com/github/mschnee/mister/maintainability)
[![dependencies Status](https://david-dm.org/mschnee/mister/status.svg)](https://david-dm.org/mschnee/mister)
[![devDependencies Status](https://david-dm.org/mschnee/mister/dev-status.svg)](https://david-dm.org/mschnee/mister?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/mschnee/mister/badge.svg?targetFile=package.json)](https://snyk.io/test/github/mschnee/mister?targetFile=package.json)

Mono-Repository -> M.R. -> Mr. -> Mister

**mister** is a set of commands that can super-simplify running tasks on a monorepository.

# Mister...
- **is** a set of commands to simplify running tasks on packages in a monorepository.
- **is not** a build system or toolchain.
- **does not** require initialization, changes to your `package.json`.
- **does not** create symlinks, or magic fake relative packages with relative path imports, or anything else.
- **does** create one single file, `.mister/build.json`, to help prevent re-building packages that have not changed.

Finally, **mister is not necessary**.  Everything mister does, you could do yourself, albeit much more tediously.

**mister** may not be the right tool for you.  There are plenty of monorepo systems available, from `yarn workspaces`, to `lerna`, and `bit`.

# So how do I use it?
Mister's only real requirement is that your monorepository packages are in the folder `packages/node_modules`.
```sh
.
├── .mister             # mr will add this to .gitignore, if you don't do it yourself.
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

Now, assuming `@scope/package2` depends on `@scope/package`, and `package4` dependes on `package3`, `@scope/package2`, and `@scope/package1`...
```sh
npm install -D @mschnee/mister
mister do package3 --tasks build
> @scope/package1
>   running [build]
> @scope/package2
>   running [build]
> package3
>   running [build]

mister do package4 --tasks build
> @scope/package1
>   [build] is up-to-date
> @scope/package2
>   [build] is up-to-date
> package1
>   [build] is up-to-date
> package4
>   running [build]

mister do package4 --tasks build
> @scope/package1
>   [build] is up-to-date
> @scope/package2
>   [build] is up-to-date
> package1
>   [build] is up-to-date
> package4
>   [build] is up-to-date
```

## Any other recommendations?
To take advantage of not having multiple dependency versions, you'll want to install all your dependencies at the top level (but you will still need to reference those dependencies in the `package.json` files of your packages).  *But you don't have to do that if you don't want to*.  Managing your dependencies is up to you ;)

## How does this even work?
It helps to read up on how [node resolves module names](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders).  The TLDR version is that, given `require('module-name')`, node will essentially walk up the filesystem until it discoveres a path matching `node_modules/module-name`.  Using `package/node_modules` to structure your monorepository means you can leverage this to `require('your-monorepository-package')` from inside of any other monorepository package, and also let you `require('external-dependency')` installed to your top-level `node_modules` folder.

## Caveats
A number of modules, like `app-root-dir` and `uglifyjs-webpack-plugin`, make assumptions about where they are located and can return incorrect path resuilts.

Even worse, some like `uglifyjs-webpack-plugin` can break your builds because they will write files assuming they have ownership of their `node_modules` entry, creating directories and files that don't actually exist, and breaking subsequent runs.

Given this simplified structure:
```sh
.
├── node_modules
│   └── uglifyjs-webpack-plugin         # The first time, require('glifyjs-webpack-plugin') resolves here
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
                └── uglifyjs-webpack-plugin  # but require('glifyjs-webpack-plugin') will now resolve this!!
                    └── .cache
```

The next time you build, node will resolve `require('uglify-webpack-plugin')` to that that folder instead.  That folder only has the cache file, the require will throw an error, and your build will fail.

Mister will attempt to detect and remove any monorepo package `node_modules` folders when invoking a command, however multipart build-scripts like `webpack fileA.js && webpack fileB.js` can still create that folder and fail.

# TODO
As of version `0.1.0`, skipping previously-built package is not yet implemented.
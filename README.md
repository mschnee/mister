MonoRepository build tools
==========================
Mono-Repository -> M.R. -> Mr. -> Mister

MR is a small suite of tools, partially inspired by `make`, to ease development of multiple packages in a monorepository.
Specifically, you will be able to:
- Build only packages that have changed
- Build only packages that have had their monorepository dependencies changed.
- Create packages that include bundled dependencies for real-world deployment.


## Structure
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

## Setup
```sh
npm install @mschnee/mr # name TDB
mr init
```
## Usage
To be written...

## Caveats
There are a lot of packages that make assumptions about what the root of a directory is, and uses them at runtime to attempt to find other dependencies.
Comprehensive Tests and Coverage
================================

Writing tests, and generating useful coverage, for your things are pretty important.
Here are some tips.

## Using NYC
`istanbul-merge` can be used for collecting the output from your `nyc` based tests.
```
istanbul-merge --out .nyc_output/raw.json packages/node_modules/**/.nyc_output/*.json && nyc report --reporter=lcov --reporter=html --reporter=text-summary
```

## Collecting Test results
Some tools, like circle-ci, require all test results to be stored under a specific folder.  It may be easiest to have specific tasks designed to output these to a specific directory:

**monorepository package.json**
```
"scripts": {
    "test-ci": "mister do-all !test-ci",
    "coverage-ci": "istanbul-merge --out .nyc_output/raw.json packages/node_modules/**/.nyc_output/*.json && nyc report --reporter=lcov --reporter=html --reporter=text-summary"
}
```

**package package.json**
```
"scripts": {
    "test-ci": "ava --tap | tap-xunit > $MISTER_ROOT/reports/$MISTER_PACKAGE/xunit.xml && nyc ava"
}
```

This should give you a top-level view of coverage and test results for your entire set of packages.
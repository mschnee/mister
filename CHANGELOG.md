# 0.1.0
First Published version.
- Adds `mister do [package1, package1, ..packageN] --tasks <task1, task2, ...taskN>`
  - This is the low level npm script runner.  All tasks named will be run on all packages named, provided the package exists and the package has a script with the given name.
  - Because dependency and command tracking has not been implemented yet, `0.1.0` will not write `.mister/build.json`.
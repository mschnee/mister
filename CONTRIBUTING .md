# How to Contribute

I made `mister` because the toolset it is based on was useful to me, and the more projects I worked on, the more I found myself reaching for, and adding to, those tools.  They became, and are becoming, `mister`, and I want `mister` to be just as helpful to you as it has been for me.

Your needs aren't mine, so pull requests, feature requests, and even cute limmericks are welcome!

By participating, you agree to abide by the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/1/3/0/code-of-conduct).

## Phiolosohy

I believe anything and everything should be up for debate, but `mister` has been developed with a simple philosophy by which it should adhere:

- Follow and respect [semver](https://semver.org/spec/v2.0.0.html).
- Place as little burden on the consumer of `mister` as possible.
- Do not modify the user's filesystem.
  - Exception: the `.mister` folder, which the user can ignore if she or he chooses.
- Write testable code...
- ... and write unit tests as well as fixtures for that code.

## Getting Started
`mister` is a fairly straightforward project:
1. Install and configure [NodeJS](https://nodejs.org).
2. Get a [GitHub](https://github.com) account.
3. Install and configure [Git](https://git-scm.com);
4. Fork `mister`
5. `npm install && npm run build`

## Patterns

Beyond a straightforward lint configuration, there are a few patterns to follow (but they're more like guidelines than rules):

- Test files go in a `__tests__` folder that is a nearby sibling of the functionality being tested.  Test runners are named `${something}.spec.ts`
- Coverage is nice, but tests should be written to thoroughly test functionality, not increase the coverage score.
- Keep it as simple as possible, but no simpler.  The CodeClimate reports are great for identifying things that might be too complicated.
- Function and variable names are relevant to what they do or represent.
- Generally, most files should contain and export a single function/class.
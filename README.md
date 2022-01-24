Gwen-Web NPM Package
====================

Easily add [Gwen-Web](https://github.com/gwen-interpreter/gwen-web) to your
existing JS projects!

Setup
-----
For npm users:
```
npm i --save-dev @gweninterpreter/gwen-web
npm run gwen init
```

For Yarn users:
```
yarn add -D @gweninterpreter/gwen-web
yarn gwen init
```

For pnpm users:
```
pnpm add -D @gweninterpreter/gwen-web
pnpm gwen init
```

### Configuration options

The behaviour of the Gwen launcher can be customized through setting some
options in package.json, under the `gwenWeb` key:

- `version`: Specifies the version of Gwen-Web to download. Can either be a
  version number, or the string `latest`, in which case the latest version of
  Gwen-Web will be used. Defaults to `latest`.
- `mavenRepo`: Specifies the Maven repo to download Gwen-Web from. Useful if you
  have eg. a local Artifactory instance to cache Gwen-Web in. Defaults to Maven
  Central (https://repo1.maven.org/maven2/), or Sonatype Snapshots
  (https://oss.sonatype.org/content/repositories/snapshots/) if a snapshot
  version was specified.

License
-------

Copyright 2021-2022 Jacob Juric

This software is open sourced under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.txt).

See also: [LICENSE](LICENSE).

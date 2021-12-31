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

### Versions

By default, running the `gwen` script will download and use the [latest Gwen-Web
version](https://github.com/gwen-interpreter/gwen-web/releases/latest). If you
want to use a [specific
version](https://github.com/gwen-interpreter/gwen-web/releases) in your project,
set the `version` field in the `gwenWeb` section of `package.json` to the
desired version, like so:

```json
"gwenWeb": {
  "version": "3.1.3"
}
```

License
-------

Copyright 2021 Jacob Juric

This software is open sourced under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.txt).

See also: [LICENSE](LICENSE).

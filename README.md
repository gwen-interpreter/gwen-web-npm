Gwen-Web NPM Package
====================

Easily add [Gwen-Web](https://github.com/gwen-interpreter/gwen-web) to your existing JS projects!

Setup
-----

For npm users:
```
npm i --save-dev @gweninterpreter/gwen-web
npm run gwen
```

For Yarn users:
```
yarn add -D @gweninterpreter/gwen-web
yarn gwen
```

For pnpm users:
```
pnpm add -D @gweninterpreter/gwen-web
pnpm gwen
```

### Versions

By default, running the `gwen` script will download and use the latest Gwen-Web
version. If you want to use a specific version in your project, set the
`version` field in the `gwen` section of `package.json` to the desired version,
like so:

```json
"gwen": {
  "version": "2.52.0"
}
```

License
-------

Copyright 2021 Jacob Juric

This software is open sourced under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.txt).

See also: [LICENSE](LICENSE).

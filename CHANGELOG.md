v2.0.0
======

- **Breaking change:** The minimum Node version requirement has been bumped from 12 to 18
- Remove dependency on axios, using builtin fetch instead
- Miscellaneous dependency updates

v1.3.0
======

- Exit with an error message if running on Node.js older than v12.0.0
- Miscellaneous dependency updates

v1.2.0
======

- Add new `mavenSnapshotRepo` configuration option
- Fix wrapper not returning exit code of Gwen process ([#56](https://github.com/gwen-interpreter/gwen-web-npm/issues/56))

v1.1.1
======

- Change snapshot repo host from https://oss.sonatype.org/ to https://s01.oss.sonatype.org/

v1.1.0
======

- Add new `mavenRepo` configuration option
- Fix Gwen output not being coloured ([#50](https://github.com/gwen-interpreter/gwen-web-npm/issues/50))

v1.0.2
======

- Update `xmldom` dependency to latest version
  - `xmldom` no longer receiving updates, replaced with `@xmldom/xmldom`

v1.0.1
======

- Initial release

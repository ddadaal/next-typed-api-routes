# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.9](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.8...v0.2.9) (2021-11-11)


### Bug Fixes

* **route:** fix null response never returns ([14181ac](https://github.com/ddadaal/next-typed-api-routes/commit/14181ac70129e6cec5bbb8df4ceef921a41d66de))

### [0.2.8](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.7...v0.2.8) (2021-11-11)


### Bug Fixes

* **client:** add missing export ([09ced34](https://github.com/ddadaal/next-typed-api-routes/commit/09ced34dbbd24255b65d5af0007eab20977daed5))
* **fetch:** http handler wrong payload ([6b4e6f2](https://github.com/ddadaal/next-typed-api-routes/commit/6b4e6f27392af01632c55f65c1f85c5a294a902d))

### [0.2.7](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.6...v0.2.7) (2021-11-11)


### Features

* **fetch:** improve fetch error design ([abacc0a](https://github.com/ddadaal/next-typed-api-routes/commit/abacc0aa6247224f45fc06a3960d287ca9be6be6))

### [0.2.6](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.5...v0.2.6) (2021-11-11)

### [0.2.5](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.4...v0.2.5) (2021-11-11)

### [0.2.4](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.3...v0.2.4) (2021-11-09)


### Bug Fixes

* **cli:** api route url should not include index ([147fbb4](https://github.com/ddadaal/next-typed-api-routes/commit/147fbb4882018fa57a57f757cb7e23185f7a398f))

### [0.2.3](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.2...v0.2.3) (2021-11-09)


### Features

* **client:** improve fetch httpError type ([ea0549c](https://github.com/ddadaal/next-typed-api-routes/commit/ea0549cda452a671a13f1389cb4790e2a7f61f9b))

### [0.2.2](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.1...v0.2.2) (2021-11-09)


### Features

* improve http error handler ([0d84e87](https://github.com/ddadaal/next-typed-api-routes/commit/0d84e8762a1798a8ed044eeeb46f93107e410532))

### [0.2.1](https://github.com/ddadaal/next-typed-api-routes/compare/v0.2.0...v0.2.1) (2021-11-09)


### Features

* allow import from root package in server package ([6a2dabb](https://github.com/ddadaal/next-typed-api-routes/commit/6a2dabbfeeae22249fb561971f1a0cd337216a02))


### Bug Fixes

* **cli:** cli use wrong fetch import path ([81f0b9c](https://github.com/ddadaal/next-typed-api-routes/commit/81f0b9c845a11a3d04722acda46eb97b7405f8ef))

## [0.2.0](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.10...v0.2.0) (2021-11-06)


### ⚠ BREAKING CHANGES

* separate client and server bundle for client tree shaking

### Features

* separate client and server bundle for client tree shaking ([b41667a](https://github.com/ddadaal/next-typed-api-routes/commit/b41667a01de7234158fdca2ebdc3345c84aad407))

### [0.1.10](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.9...v0.1.10) (2021-11-04)


### Bug Fixes

* infer req.body type correctly ([e49925b](https://github.com/ddadaal/next-typed-api-routes/commit/e49925b78a8ea2b857e78951de11810417b5d6ec))

### [0.1.9](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.8...v0.1.9) (2021-11-04)


### Features

* support finally on FetchResult ([25ff1f6](https://github.com/ddadaal/next-typed-api-routes/commit/25ff1f695485f79436ac75d6cb2d14fa8e3a1d8d))


### Bug Fixes

* change coerceType to "array" ([8ce1631](https://github.com/ddadaal/next-typed-api-routes/commit/8ce1631fd9c589785db56de32b15c23e05c73d99))

### [0.1.8](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.7...v0.1.8) (2021-10-12)


### Bug Fixes

* enable coerceTypes ([045bde2](https://github.com/ddadaal/next-typed-api-routes/commit/045bde2fc2c006c5fe732abbd32715ac73d36f5e))

### [0.1.7](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.6...v0.1.7) (2021-10-12)

### [0.1.6](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.5...v0.1.6) (2021-10-12)


### Bug Fixes

* export JsonFetchResultPromiseLike ([145d068](https://github.com/ddadaal/next-typed-api-routes/commit/145d06851c7ae8ba7c8e34756c5fa47b17e7742e))

### [0.1.5](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.4...v0.1.5) (2021-09-30)


### Bug Fixes

* **package:** add long to suppress fsj warning ([f99c62a](https://github.com/ddadaal/next-typed-api-routes/commit/f99c62aca12ef6c7701cd62f59f96230cf604ec4))
* **route:** allow union types ([f7f542f](https://github.com/ddadaal/next-typed-api-routes/commit/f7f542f7f6ceacb52461b5231933deac5b9d947c))
* **route:** body validation error code ([310a315](https://github.com/ddadaal/next-typed-api-routes/commit/310a3153d238f3abff3f10da71dc79bc40a3eacb))
* **route:** show complete error messages for param validation ([50bfaff](https://github.com/ddadaal/next-typed-api-routes/commit/50bfaff62bf7e0d1cec9b89c1470f65c61ed26c2))

### [0.1.4](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.3...v0.1.4) (2021-09-30)


### Bug Fixes

* **client:** use string literals instead ts factory to generate api file ([335e9a5](https://github.com/ddadaal/next-typed-api-routes/commit/335e9a5aac223894064e7db9ab247d333e226f79))

### [0.1.3](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.2...v0.1.3) (2021-09-30)


### Bug Fixes

* **cli:** check path existence ([15f34cf](https://github.com/ddadaal/next-typed-api-routes/commit/15f34cfe13a5f5dd4b8fc2d66314813130d702dd))
* generate schemas.json in the module dir ([4de1afc](https://github.com/ddadaal/next-typed-api-routes/commit/4de1afc63808f5676cc34907e174490cadf5e8b1))
* **package:** disable modern package (next doesn't support it) ([763c6cf](https://github.com/ddadaal/next-typed-api-routes/commit/763c6cf8b0e2338f2c3cc870118593a517787deb))

### [0.1.2](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.1...v0.1.2) (2021-09-29)


### Bug Fixes

* package name in client generation ([bbd4737](https://github.com/ddadaal/next-typed-api-routes/commit/bbd47372be0e77151d005a18c3934fb1781bf510))

### [0.1.1](https://github.com/ddadaal/next-typed-api-routes/compare/v0.1.0...v0.1.1) (2021-09-29)


### Bug Fixes

* missing dependencies for cli ([61d66ba](https://github.com/ddadaal/next-typed-api-routes/commit/61d66ba027166f202106c886c9334e2ba4574dde))

## 0.1.0 (2021-09-29)

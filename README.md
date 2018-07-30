# rollup-plugin-auto-external

[![Build Status](https://travis-ci.org/stevenbenisek/rollup-plugin-auto-external.svg?branch=master)](https://travis-ci.org/stevenbenisek/rollup-plugin-auto-external)

> [Rollup](https://rollupjs.org/) plugin to automatically exclude package.json dependencies and peerDependencies from your bundle.

## Install

```bash
npm install --save-dev rollup-plugin-auto-external
```

## Usage

##### Example `rollup.config.js`

```js
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'index.js',
  plugins: [autoExternal()],
};
```

##### Example `rollup.config.js` with options

```js
import path from 'path';
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'index.js',
  plugins: [
    autoExternal({
      builtins: false,
      dependencies: true,
      packagePath: path.resolve('./packages/module/package.json'),
      peerDependencies: false,
    }),
  ],
};
```

##### Example `rollup.config.js` with [external](https://github.com/rollup/rollup/wiki/JavaScript-API#external)

`rollup-plugin-auto-external` does not overwrite the [external](https://github.com/rollup/rollup/wiki/JavaScript-API#external) option. The two can happily coexist.

```js
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'index.js',
  external: id => id.includes('babel-runtime'),
  plugins: [autoExternal()],
};
```

##### Example `rollup.config.js` with per format options

```js
import autoExternal from 'rollup-plugin-auto-external';

export default ['es', 'umd'].map(format => ({
  input: 'index.js',
  plugins: [
    autoExternal({
      dependencies: format === 'es',
    }),
  ],
}));
```

### Options

#### `builtins`

`boolean`|`string`: defaults to `true`. Add all Node.js builtin modules (in the running version) as externals. Specify a `string` value (e.g., `'6.0.0'`) to add all builtin modules for a _specific version_ of Node.js.

Rollup will complain if `builtins` is present, and the build target is a browser. You may want [rollup-plugin-node-builtins](https://npm.im/package/rollup-plugin-node-builtins).

#### `dependencies`

`boolean`: defaults to `true`.

#### `packagePath`

`string`: defaults to `process.cwd()`. Path to a package.json file or its directory.

#### `peerDependencies`

`boolean`: defaults to `true`.

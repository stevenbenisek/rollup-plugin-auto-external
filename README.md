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
  entry: 'index.js',
  plugins: [
    autoExternal(),
  ],
};
```

##### Example `rollup.config.js` with options

```js
import autoExternal from 'rollup-plugin-auto-external';

export default {
  entry: 'index.js',
  plugins: [
    autoExternal({
      dependencies: true,
      peerDependencies: false,
      builtins: false
    }),
  ],
};
```

##### Example `rollup.config.js` with [external](https://github.com/rollup/rollup/wiki/JavaScript-API#external)

`rollup-plugin-auto-external` does not overwrite the [external](https://github.com/rollup/rollup/wiki/JavaScript-API#external) option. The two can happily coexist.

```js
import autoExternal from 'rollup-plugin-auto-external';

export default {
  entry: 'index.js',
  external: id => id.includes('babel-runtime'),
  plugins: [
    autoExternal(),
  ],
};
```

### Options

#### `dependencies`

`boolean`: defaults to `true` if the bundle [format](https://github.com/rollup/rollup/wiki/JavaScript-API#format) is `cjs` or `es`; `false` otherwise.

#### `peerDependencies`

`boolean`: defaults to `true`.

#### `builtins`

`boolean`|`string`: defaults to `false`. Pass `true` to add all Node.js builtin modules (in the running version) as externals. Specify a `string` value (e.g., `'6.0.0'`) to add all builtin modules for a *specific version* of Node.js. 

Rollup will complain if `builtins` is present, and the build target is a browser. You may want [rollup-plugin-node-builtins](https://npm.im/package/rollup-plugin-node-builtins).


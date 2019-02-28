const path = require('path');
const rollup = require('rollup');
const builtins = require('rollup-plugin-node-builtins');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const autoExternal = require('../index');

const bundle = ({ input, external }, options) => {
  process.chdir(path.dirname(input));

  return rollup
    .rollup({
      external,
      input,
      plugins: [autoExternal(options), builtins(), nodeResolve(), commonjs()],
    })
    .then(bundle => bundle.generate({ format: 'esm' }))
    .then(result => result.output[0].code)
    .then(code => expect(code).toMatchSnapshot());
};

let cwd;

beforeAll(() => {
  cwd = process.cwd();
});

afterEach(() => {
  process.chdir(cwd);
});

describe('autoExternal(options)', () => {
  it('should have a name', () => {
    expect(autoExternal().name).toEqual('auto-external');
  });

  it('should add dependencies by default', () =>
    bundle({
      input: path.resolve(__dirname, '../__fixtures__/deps/index.js'),
    }));

  it('should handle disabling dependencies', () =>
    bundle(
      { input: path.resolve(__dirname, '../__fixtures__/deps/index.js') },
      { dependencies: false }
    ));

  it('should add peerDependencies by default', () =>
    bundle({
      input: path.resolve(__dirname, '../__fixtures__/peer-deps/index.js'),
    }));

  it('should handle disabling peerDependencies', () =>
    bundle(
      { input: path.resolve(__dirname, '../__fixtures__/peer-deps/index.js') },
      { peerDependencies: false }
    ));

  it('should add builtins by default', () =>
    bundle({
      input: path.resolve(__dirname, '../__fixtures__/builtins/index.js'),
    }));

  it('should handle disabling builtins', () =>
    bundle(
      { input: path.resolve(__dirname, '../__fixtures__/builtins/index.js') },
      { builtins: false }
    ));

  it('should handle adding builtins for a specific Node.js version', () =>
    bundle(
      {
        input: path.resolve(
          __dirname,
          '../__fixtures__/builtins-6.0.0/index.js'
        ),
      },
      { builtins: '6.0.0' }
    ));

  it('should handle extending external array', () =>
    bundle({
      input: path.resolve(__dirname, '../__fixtures__/deps/index.js'),
      external: ['baz'],
    }));

  it('should handle extending external function', () =>
    bundle({
      input: path.resolve(__dirname, '../__fixtures__/deps/index.js'),
      external: id => id.includes('baz'),
    }));

  it('should handle a custom package file path', () =>
    bundle(
      { input: path.resolve(__dirname, '../__fixtures__/deps/index.js') },
      {
        packagePath: path.resolve(
          __dirname,
          '../__fixtures__/package-path/package.json'
        ),
      }
    ));

  it('should handle a directory path as the packagePath', () =>
    bundle(
      { input: path.resolve(__dirname, '../__fixtures__/deps/index.js') },
      { packagePath: path.resolve(__dirname, '../__fixtures__/package-path') }
    ));

  it('should handle cherry picked modules', () =>
    bundle({
      input: path.resolve(__dirname, '../__fixtures__/cherry-picked/index.js'),
    }));

  it('should handle scoped modules', () =>
    bundle({
      input: path.resolve(__dirname, '../__fixtures__/scoped/index.js'),
    }));
});

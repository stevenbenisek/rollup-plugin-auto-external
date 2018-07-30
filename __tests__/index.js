const path = require('path');
const autoExternal = require('../index');
const getBuiltins = require('builtins');
const pkgDirPath = path.resolve(__dirname, '..');
const pkgFilePath = path.resolve(pkgDirPath, 'package.json');
const pkg = require(pkgFilePath);
const customPkgFilePath = path.resolve(__dirname, 'pkg.json');
const customPkg = require(customPkgFilePath);

describe('autoExternal(options)', () => {
  it('should have a name', () => {
    expect(autoExternal().name).toEqual('auto-external');
  });

  it('should add builtins, dependencies and peerDependencies by default', () => {
    expect(autoExternal().options({}).external).toEqual(
      [].concat(
        Object.keys(pkg.dependencies),
        Object.keys(pkg.peerDependencies),
        getBuiltins()
      )
    );
  });

  it('should handle disabling builtins', () => {
    expect(autoExternal({ builtins: false }).options({}).external).toEqual(
      [].concat(
        Object.keys(pkg.dependencies),
        Object.keys(pkg.peerDependencies)
      )
    );
  });

  it('should handle disabling dependencies', () => {
    expect(autoExternal({ dependencies: false }).options({}).external).toEqual(
      [].concat(Object.keys(pkg.peerDependencies), getBuiltins())
    );
  });

  it('should handle disabling peerDependencies', () => {
    expect(
      autoExternal({ peerDependencies: false }).options({}).external
    ).toEqual([].concat(Object.keys(pkg.dependencies), getBuiltins()));
  });

  it('should handle extending external array', () => {
    expect(
      autoExternal().options({ external: ['non-builtin-module'] }).external
    ).toEqual(
      [].concat(
        'non-builtin-module',
        Object.keys(pkg.dependencies),
        Object.keys(pkg.peerDependencies),
        getBuiltins()
      )
    );
  });

  it('should dedupe the array', () => {
    expect(
      autoExternal().options({
        external: ['non-builtin-module'].concat(
          Object.keys(pkg.dependencies)[0]
        ),
      }).external
    ).toEqual(
      [].concat(
        'non-builtin-module',
        Object.keys(pkg.dependencies),
        Object.keys(pkg.peerDependencies),
        getBuiltins()
      )
    );
  });

  it('should handle extending external function', () => {
    const { external } = autoExternal().options({
      external: id => id.includes('non-builtin-module'),
    });

    expect(typeof external).toEqual('function');
    expect(external.length).toEqual(1);
    expect(external('path/to/non-builtin-module')).toEqual(true);
  });

  it('should not throw when resolving an unknown module', () => {
    const { external } = autoExternal().options({
      external: id => id.includes('non-builtin-module'),
    });

    expect(() => external('path/to/unknow')).not.toThrow();
  });

  it('should handle adding builtins for a specific Node.js version', () => {
    expect(autoExternal({ builtins: '6.0.0' }).options({}).external).toEqual(
      [].concat(
        Object.keys(pkg.dependencies),
        Object.keys(pkg.peerDependencies),
        getBuiltins('6.0.0')
      )
    );
  });

  it('should handle a directory path as the packagePath', () => {
    expect(
      autoExternal({
        packagePath: pkgDirPath,
      }).options({}).external
    ).toEqual(
      [].concat(
        Object.keys(pkg.dependencies),
        Object.keys(pkg.peerDependencies),
        getBuiltins()
      )
    );
  });

  it('should handle a file path as the packagePath', () => {
    expect(
      autoExternal({
        packagePath: customPkgFilePath,
      }).options({}).external
    ).toEqual(
      [].concat(
        Object.keys(customPkg.dependencies),
        Object.keys(customPkg.peerDependencies),
        getBuiltins()
      )
    );
  });
});

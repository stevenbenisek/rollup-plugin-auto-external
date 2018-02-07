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

  it('should add dependencies and peerDependencies by default', () => {
    expect(autoExternal().options({}).external).toEqual(
      Object.keys(Object.assign({}, pkg.dependencies, pkg.peerDependencies))
    );

    expect(
      autoExternal().options({ targets: [{ format: 'cjs' }, { format: 'es' }] })
        .external
    ).toEqual(
      Object.keys(Object.assign({}, pkg.dependencies, pkg.peerDependencies))
    );
  });

  it('should not add dependencies by default if the format is `amd`, `iife` or `umd`', () => {
    expect(autoExternal().options({ format: 'amd' }).external).toEqual(
      Object.keys(pkg.peerDependencies)
    );

    expect(autoExternal().options({ format: 'iife' }).external).toEqual(
      Object.keys(pkg.peerDependencies)
    );

    expect(autoExternal().options({ format: 'umd' }).external).toEqual(
      Object.keys(pkg.peerDependencies)
    );
  });

  it('should not add dependencies by default if the format of at least one of the targets is `amd`, `iife` or `umd`', () => {
    expect(
      autoExternal().options({ targets: [{ format: 'amd' }, { format: 'es' }] })
        .external
    ).toEqual(Object.keys(pkg.peerDependencies));

    expect(
      autoExternal().options({
        targets: [{ format: 'iife' }, { format: 'es' }],
      }).external
    ).toEqual(Object.keys(pkg.peerDependencies));

    expect(
      autoExternal().options({ targets: [{ format: 'amd' }, { format: 'es' }] })
        .external
    ).toEqual(Object.keys(pkg.peerDependencies));
  });

  it('should handle disabling dependencies', () => {
    expect(autoExternal({ dependencies: false }).options({}).external).toEqual(
      Object.keys(pkg.peerDependencies)
    );
  });

  it('should handle disabling peerDependencies', () => {
    expect(
      autoExternal({ peerDependencies: false }).options({}).external
    ).toEqual(Object.keys(pkg.dependencies));
  });

  it('should handle extending external array', () => {
    expect(autoExternal().options({ external: ['module'] }).external).toEqual(
      ['module'].concat(
        Object.keys(Object.assign({}, pkg.dependencies, pkg.peerDependencies))
      )
    );
  });

  it('should dedupe the array', () => {
    expect(
      autoExternal().options({
        external: ['module'].concat(Object.keys(pkg.dependencies)[0]),
      }).external
    ).toEqual(
      ['module'].concat(
        Object.keys(Object.assign({}, pkg.dependencies, pkg.peerDependencies))
      )
    );
  });

  it('should handle extending external function', () => {
    const { external } = autoExternal().options({
      external: id => id.includes('module'),
    });

    expect(typeof external).toEqual('function');
    expect(external.length).toEqual(1);
    expect(external('path/to/module')).toEqual(true);
  });

  it('should not throw when resolving an unknown module', () => {
    const { external } = autoExternal().options({
      external: id => id.includes('module'),
    });

    expect(() => external('path/to/unknow')).not.toThrow();
  });

  it('should handle adding builtins', () => {
    expect(autoExternal({ builtins: true }).options({}).external).toEqual(
      Object.keys(
        Object.assign({}, pkg.dependencies, pkg.peerDependencies)
      ).concat(getBuiltins())
    );
  });

  it('should handle adding builtins for a specific Node.js version', () => {
    expect(autoExternal({ builtins: '6.0.0' }).options({}).external).toEqual(
      Object.keys(
        Object.assign({}, pkg.dependencies, pkg.peerDependencies)
      ).concat(getBuiltins('6.0.0'))
    );
  });

  it('should handle a directory path as the packagePath', () => {
    expect(
      autoExternal({
        packagePath: pkgDirPath,
      }).options({}).external
    ).toEqual(
      Object.keys(Object.assign({}, pkg.dependencies, pkg.peerDependencies))
    );
  });

  it('should handle a file path as the packagePath', () => {
    expect(
      autoExternal({
        packagePath: customPkgFilePath,
      }).options({}).external
    ).toEqual(
      Object.keys(
        Object.assign({}, customPkg.dependencies, customPkg.peerDependencies)
      )
    );
  });
});

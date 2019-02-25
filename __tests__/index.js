const getBuiltins = require('builtins');
const path = require('path');
const safeResolve = require('safe-resolve');
const autoExternal = require('../index');
const pkgDirPath = path.resolve(__dirname, '..');
const pkgFilePath = path.resolve(pkgDirPath, 'package.json');
const pkg = require(pkgFilePath);
const customPkgFilePath = path.resolve(__dirname, 'pkg.json');
const customPkg = require(customPkgFilePath);

const difference = arr => x => !arr.includes(x);

describe('autoExternal(options)', () => {
  it('should have a name', () => {
    expect(autoExternal().name).toEqual('auto-external');
  });

  it('should add builtins, dependencies and peerDependencies by default', () => {
    const { external } = autoExternal().options({});
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should handle disabling builtins', () => {
    const { external } = autoExternal({ builtins: false }).options({});
    const diff = difference(getBuiltins());
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports.filter(diff));
  });

  it('should handle disabling dependencies', () => {
    const { external } = autoExternal({ dependencies: false }).options({});
    const diff = difference(Object.keys(pkg.dependencies));
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports.filter(diff));
  });

  it('should handle disabling peerDependencies', () => {
    const { external } = autoExternal({ peerDependencies: false }).options({});
    const diff = difference(Object.keys(pkg.peerDependencies));
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports.filter(diff));
  });

  it('should handle extending external array', () => {
    const { external } = autoExternal({ peerDependencies: false }).options({
      external: Object.keys(pkg.peerDependencies),
    });
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should handle extending external function', () => {
    const { external } = autoExternal({ peerDependencies: false }).options({
      external: id => Object.keys(pkg.peerDependencies).includes(id),
    });
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should not throw when resolving an unknown module', () => {
    const { external } = autoExternal().options({});

    expect(() => external('path/to/unknow')).not.toThrow();
  });

  it('should handle adding builtins for a specific Node.js version', () => {
    const { external } = autoExternal({ builtins: '6.0.0' }).options({});
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins('6.0.0')
    );
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should handle a directory path as the packagePath', () => {
    const { external } = autoExternal({
      packagePath: pkgDirPath,
    }).options({});
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should handle a custom package file path', () => {
    const { external } = autoExternal({
      packagePath: customPkgFilePath,
    }).options({});
    const imports = [].concat(
      Object.keys(customPkg.dependencies),
      getBuiltins()
    );
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should handle cherry picked modules', () => {
    const { external } = autoExternal({
      builtins: false,
      packagePath: customPkgFilePath,
      peerDependencies: false,
    }).options({});
    const imports = ['lodash/fp'];
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should handle scoped modules', () => {
    const { external } = autoExternal({
      builtins: false,
      peerDependencies: false,
      packagePath: customPkgFilePath,
    }).options({});
    const imports = ['@babel/core'];
    expect(imports.filter(external)).toEqual(imports);
  });

  it('should handle resolved import paths', () => {
    const { external } = autoExternal().options({});
    const imports = [].concat(
      Object.keys(pkg.dependencies),
      Object.keys(pkg.peerDependencies),
      getBuiltins()
    );
    expect(imports.map(safeResolve).filter(external).length).toEqual(
      imports.length
    );
  });
});

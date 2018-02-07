const safeResolve = require('safe-resolve');
const getBuiltins = require('builtins');
const readPkg = require('read-pkg');

module.exports = ({
  builtins,
  dependencies,
  packagePath,
  peerDependencies = true,
} = {}) => ({
  name: 'auto-external',
  options(opts) {
    const pkg = readPkg.sync(packagePath);
    let external = [];
    let ids = [];

    if (dependencies == undefined) {
      dependencies = !(opts.targets || [opts]).some(({ format }) =>
        ['amd', 'iife', 'umd'].includes(format)
      );
    }

    if (dependencies && pkg.dependencies) {
      ids = ids.concat(Object.keys(pkg.dependencies));
    }

    if (peerDependencies && pkg.peerDependencies) {
      ids = ids.concat(Object.keys(pkg.peerDependencies));
    }

    if (builtins) {
      ids = ids.concat(
        builtins === true ? getBuiltins() : getBuiltins(builtins)
      );
    }

    if (typeof opts.external === 'function') {
      external = id =>
        opts.external(id) ||
        ids
          .map(safeResolve)
          .filter(Boolean)
          .includes(id);
    } else {
      external = Array.from(new Set((opts.external || []).concat(ids)));
    }

    return Object.assign({}, opts, { external });
  },
});

const getBuiltins = require('builtins');
const readPkg = require('read-pkg');
const safeResolve = require('safe-resolve');
const semver = require('semver');

module.exports = ({
  builtins,
  dependencies = true,
  packagePath,
  peerDependencies = true,
} = {}) => ({
  name: 'auto-external',
  options(opts) {
    const pkg = readPkg.sync(packagePath);
    let external = [];
    let ids = [];

    if (dependencies && pkg.dependencies) {
      ids = ids.concat(Object.keys(pkg.dependencies));
    }

    if (peerDependencies && pkg.peerDependencies) {
      ids = ids.concat(Object.keys(pkg.peerDependencies));
    }

    if (builtins) {
      ids = ids.concat(getBuiltins(semver.valid(builtins)));
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

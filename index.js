const getBuiltins = require('builtins');
const path = require('path');
const readPkg = require('read-pkg');
const safeResolve = require('safe-resolve');
const semver = require('semver');

module.exports = ({
  builtins = true,
  dependencies = true,
  packagePath,
  peerDependencies = true,
} = {}) => ({
  name: 'auto-external',
  options(opts) {
    const pkg = readPkg.sync(packagePath);
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

    ids = ids.map(safeResolve).filter(Boolean);

    const external = id => {
      if (typeof opts.external === 'function' && opts.external(id)) {
        return true;
      }

      if (Array.isArray(opts.external) && opts.external.includes(id)) {
        return true;
      }

      /**
       * The `id` argument is a resolved path if `rollup-plugin-node-resolve`
       * and `rollup-plugin-commonjs` are included.
       */
      const resolvedPath = safeResolve(id);

      if (resolvedPath === null) {
        return false;
      }

      const resolvedDirname = path.dirname(resolvedPath);

      return ids.some(idx => resolvedDirname.startsWith(path.dirname(idx)));
    };

    return Object.assign({}, opts, { external });
  },
});

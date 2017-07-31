const path = require('path');
const safeResolve = require('safe-resolve');
const pkg = require(path.resolve('package.json'));

module.exports = ({ dependencies, peerDependencies = true } = {}) => ({
  name: 'auto-external',
  options(opts) {
    let external = [];
    let ids = [];

    if (dependencies == undefined) {
      dependencies = !(opts.targets || [opts])
        .some(({ format }) => ['amd', 'iife', 'umd'].includes(format));
    }

    if (dependencies && pkg.dependencies) {
      ids = ids.concat(Object.keys(pkg.dependencies));
    }

    if (peerDependencies && pkg.peerDependencies) {
      ids = ids.concat(Object.keys(pkg.peerDependencies));
    }

    if (typeof opts.external === 'function') {
      external = id =>
        opts.external(id) || ids.map(safeResolve).filter(Boolean).includes(id);
    } else {
      external = (opts.external || []).concat(ids);
    }

    return Object.assign({}, opts, { external });
  },
});

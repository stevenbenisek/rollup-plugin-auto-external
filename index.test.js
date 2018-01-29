const autoExternal = require('./index');
const getBuiltins = require('builtins');

jest.mock(
  './package.json',
  () => ({
    dependencies: {
      depModule: '^0.1.0',
    },
    peerDependencies: {
      peerModule: '^0.1.0',
    },
  }),
  { virtual: true }
);

describe('autoExternal(options)', () => {
  it('should have a name', () => {
    expect(autoExternal().name).toEqual('auto-external');
  });

  it('should add dependencies and peerDependencies by default', () => {
    expect(autoExternal().options({}).external).toEqual([
      'depModule',
      'peerModule',
    ]);

    expect(
      autoExternal().options({ targets: [{ format: 'cjs' }, { format: 'es' }] })
        .external
    ).toEqual(['depModule', 'peerModule']);
  });

  it('should not add dependencies by default if the format is `amd`, `iife` or `umd`', () => {
    expect(autoExternal().options({ format: 'amd' }).external).toEqual([
      'peerModule',
    ]);

    expect(autoExternal().options({ format: 'iife' }).external).toEqual([
      'peerModule',
    ]);

    expect(autoExternal().options({ format: 'umd' }).external).toEqual([
      'peerModule',
    ]);
  });

  it('should not add dependencies by default if the format of at least one of the targets is `amd`, `iife` or `umd`', () => {
    expect(
      autoExternal().options({ targets: [{ format: 'amd' }, { format: 'es' }] })
        .external
    ).toEqual(['peerModule']);

    expect(
      autoExternal().options({
        targets: [{ format: 'iife' }, { format: 'es' }],
      }).external
    ).toEqual(['peerModule']);

    expect(
      autoExternal().options({ targets: [{ format: 'amd' }, { format: 'es' }] })
        .external
    ).toEqual(['peerModule']);
  });

  it('should handle disabling dependencies', () => {
    expect(autoExternal({ dependencies: false }).options({}).external).toEqual([
      'peerModule',
    ]);
  });

  it('should handle disabling peerDependencies', () => {
    expect(
      autoExternal({ peerDependencies: false }).options({}).external
    ).toEqual(['depModule']);
  });

  it('should handle extending external array', () => {
    expect(autoExternal().options({ external: ['module'] }).external).toEqual([
      'module',
      'depModule',
      'peerModule',
    ]);
  });

  it('should dedupe the array', () => {
    expect(autoExternal().options({ external: ['module', 'depModule'] }).external)
      .toEqual([
        'module', 'depModule', 'peerModule'
      ]);
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
    expect(autoExternal({ builtins: true }).options({}).external).toEqual([
      'depModule',
      'peerModule'
    ].concat(getBuiltins()));
  });

  it('should handle adding builtins for a specific Node.js version', () => {
    expect(autoExternal({ builtins: '6.0.0' }).options({}).external).toEqual([
      'depModule',
      'peerModule'
    ].concat(getBuiltins('6.0.0')));
  });
});

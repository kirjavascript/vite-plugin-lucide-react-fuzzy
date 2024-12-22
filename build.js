const esbuild = require('esbuild');

const buildOptions = {
  entryPoints: ['./plugin.ts'],
  bundle: false,
  sourcemap: false,
  minify: false,
  target: 'esnext',
  platform: 'node',
};

esbuild.build({
  ...buildOptions,
  outfile: './dist/index.js',
  format: 'cjs',
}).then(() => console.log('CJS build complete.'));

esbuild.build({
  ...buildOptions,
  outfile: './dist/index.mjs',
  format: 'esm',
}).then(() => console.log('ESM build complete.'));

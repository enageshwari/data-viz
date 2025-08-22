import { build } from 'esbuild';

build({
  entryPoints: ['./src/renderer.tsx'],
  bundle: true,
  format: 'esm',
  outfile: 'out/renderer.js',
  platform: 'browser',
  jsx: 'automatic',
  external: [],
  target: ['es2020'],
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
}).catch(() => process.exit(1));
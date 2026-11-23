import * as esbuild from 'esbuild';
import fs from 'node:fs';

async function build() {
  console.log('Building alifeo-job worker bundle...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    sourcemap: true,
    minify: false,
    external: ['cloudflare:workers']
  });

  const stats = fs.statSync('dist/index.js');
  console.log(`Build complete! Output size: ${(stats.size / 1024).toFixed(1)} KB`);
}

build().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});

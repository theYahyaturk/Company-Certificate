import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('Building alifeo-job worker bundle...');
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const entryFile = path.join(__dirname, 'src', 'index.ts');
  const outFile = path.join(distDir, 'index.js');

  await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    outfile: outFile,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    sourcemap: true,
    minify: false,
    external: ['cloudflare:workers']
  });

  const stats = fs.statSync(outFile);
  console.log(`Build complete! Output size: ${(stats.size / 1024).toFixed(1)} KB at ${outFile}`);
}

build().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});

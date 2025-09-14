import { build } from 'esbuild';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function getEntryPoints(dir) {
  const entries = [];
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = join(dir, file.name);
    if (file.isDirectory()) {
      entries.push(...await getEntryPoints(fullPath));
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.test.ts')) {
      entries.push(fullPath);
    }
  }
  
  return entries;
}

async function buildCJS() {
  const entryPoints = await getEntryPoints('./src');
  
  await build({
    entryPoints,
    bundle: false,
    format: 'cjs',
    platform: 'node',
    target: 'node16',
    outdir: './dist/cjs',
    outExtension: { '.js': '.js' },
    sourcemap: false,
    keepNames: true,
    preserveSymlinks: true,
  });
}

buildCJS().catch(console.error);
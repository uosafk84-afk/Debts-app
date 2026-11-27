import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webDir = resolve(root, 'www');
const vendorDir = resolve(webDir, 'vendor');

await mkdir(vendorDir, { recursive: true });

for (const file of [
  'index.html',
  'manifest.json',
  'sw.js',
  'recover.html',
  'privacy-policy.html',
  'icon-192.png',
  'icon-512.png',
  'logo-star.png',
  'logo-badge.png',
]) {
  await copyFile(resolve(root, file), resolve(webDir, file));
}

await copyFile(
  resolve(root, 'node_modules/xlsx/dist/xlsx.full.min.js'),
  resolve(vendorDir, 'xlsx.full.min.js'),
);

for (const file of [
  'firebase-app-compat.js',
  'firebase-auth-compat.js',
  'firebase-firestore-compat.js',
  'FIREBASE-LICENSE.txt',
  'SHEETJS-LICENSE.txt',
  'THIRD_PARTY_NOTICES.txt',
]) {
  await copyFile(resolve(root, 'vendor', file), resolve(vendorDir, file));
}

await build({
  entryPoints: [resolve(root, 'scripts/native-backup.js')],
  outfile: resolve(vendorDir, 'native-backup.js'),
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2020'],
});

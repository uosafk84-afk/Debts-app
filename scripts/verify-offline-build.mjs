import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webDir = resolve(root, 'www');

for (const file of [
  'index.html',
  'recover.html',
  'vendor/xlsx.full.min.js',
  'vendor/firebase-app-compat.js',
  'vendor/firebase-auth-compat.js',
  'vendor/firebase-firestore-compat.js',
  'vendor/native-backup.js',
]) {
  await access(resolve(webDir, file));
}

for (const file of ['index.html', 'recover.html']) {
  const html = await readFile(resolve(webDir, file), 'utf8');
  const scriptSources = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
    .map((match) => match[1]);
  if (scriptSources.some((source) => /^https?:\/\//i.test(source))) {
    throw new Error(`${file} loads a script from the network.`);
  }
}

const serviceWorker = await readFile(resolve(webDir, 'sw.js'), 'utf8');
if (/https?:\/\//i.test(serviceWorker)) {
  throw new Error('The service worker contains a remote asset URL.');
}

const capacitorConfig = JSON.parse(await readFile(resolve(root, 'capacitor.config.json'), 'utf8'));
if (capacitorConfig.appId !== 'com.debtsapp.app') {
  throw new Error('The Android application ID changed unexpectedly.');
}

console.log('Offline app assets and fixed Android application ID verified.');

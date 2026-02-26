/**
 * afterPack hook for electron-builder.
 * Copies the standalone Next.js build (WITH node_modules) into resources/
 * after electron-builder finishes packaging (which strips node_modules).
 */
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true, dereference: true });
}

module.exports = async function afterPack(context) {
  const appOutDir = context.appOutDir;
  const resourcesDir = path.join(appOutDir, 'resources');
  const standaloneDir = path.join(resourcesDir, 'standalone');
  const projectOutput = path.join(__dirname, '..', '.next', 'standalone');
  const staticDir = path.join(__dirname, '..', '.next', 'static');
  const publicDir = path.join(__dirname, '..', 'public');

  console.log(`[afterPack] Copying Next.js standalone output to ${standaloneDir}`);

  // Remove incomplete standalone (without node_modules) if electron-builder created it
  if (fs.existsSync(standaloneDir)) {
    fs.rmSync(standaloneDir, { recursive: true, force: true });
  }

  // Copy the full standalone (with node_modules)
  copyDir(projectOutput, standaloneDir);

  // Copy static and public which Next.js needs
  copyDir(staticDir, path.join(standaloneDir, '.next', 'static'));
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, path.join(standaloneDir, 'public'));
  }

  // Verify
  const nmDir = path.join(standaloneDir, 'node_modules');
  if (fs.existsSync(nmDir)) {
    const count = fs.readdirSync(nmDir).length;
    console.log(`[afterPack] ✓ node_modules copied (${count} packages)`);
  } else {
    console.error('[afterPack] ✗ node_modules MISSING!');
  }
};

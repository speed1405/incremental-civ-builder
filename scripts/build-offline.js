#!/usr/bin/env node
/**
 * Build script to create a self-contained offline HTML file
 * This inlines all CSS and JavaScript so the game can be played
 * by simply opening the HTML file in a browser.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read the source files
const indexHtml = readFileSync(join(projectRoot, 'index.html'), 'utf-8');
const stylesCss = readFileSync(join(projectRoot, 'styles.css'), 'utf-8');
const bundleJs = readFileSync(join(projectRoot, 'dist', 'bundle.js'), 'utf-8');

// Create the self-contained HTML
let offlineHtml = indexHtml;

// Replace the CSS link with inline styles
offlineHtml = offlineHtml.replace(
  '<link rel="stylesheet" href="styles.css">',
  `<style>\n${stylesCss}\n</style>`
);

// Replace the script src with inline script
offlineHtml = offlineHtml.replace(
  '<script src="dist/bundle.js"></script>',
  `<script>\n${bundleJs}\n</script>`
);

// Ensure dist directory exists
if (!existsSync(join(projectRoot, 'dist'))) {
  mkdirSync(join(projectRoot, 'dist'), { recursive: true });
}

// Write the offline version
const outputPath = join(projectRoot, 'dist', 'game-offline.html');
writeFileSync(outputPath, offlineHtml, 'utf-8');

console.log(`✅ Offline game built successfully!`);
console.log(`📁 Output: dist/game-offline.html`);
console.log(`\n🎮 To play: Simply open dist/game-offline.html in your browser`);

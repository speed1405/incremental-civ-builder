#!/usr/bin/env node
/**
 * Build script to create a self-contained offline HTML file
 * This inlines all CSS and JavaScript directly into index.html so the game
 * can be played by simply opening index.html in a browser - no server needed.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Define file paths
const indexPath = join(projectRoot, 'index.html');
const stylesPath = join(projectRoot, 'styles.css');
const bundlePath = join(projectRoot, 'dist', 'bundle.js');

// Check that required files exist
const requiredFiles = [
  { path: indexPath, name: 'index.html' },
  { path: stylesPath, name: 'styles.css' },
  { path: bundlePath, name: 'dist/bundle.js (run "npm run bundle" first)' },
];

for (const file of requiredFiles) {
  if (!existsSync(file.path)) {
    console.error(`❌ Error: Required file not found: ${file.name}`);
    process.exit(1);
  }
}

// Read the source files
let indexHtml, stylesCss, bundleJs;
try {
  indexHtml = readFileSync(indexPath, 'utf-8');
  stylesCss = readFileSync(stylesPath, 'utf-8');
  bundleJs = readFileSync(bundlePath, 'utf-8');
} catch (error) {
  console.error(`❌ Error reading source files: ${error.message}`);
  process.exit(1);
}

// Create the self-contained HTML by inlining CSS and JS
let offlineHtml = indexHtml;

// Replace the CSS link with inline styles (handles variations in formatting)
offlineHtml = offlineHtml.replace(
  /<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']\s*\/?>/i,
  `<style>\n${stylesCss}\n</style>`
);

// Replace the script src with inline script (handles variations in formatting)
offlineHtml = offlineHtml.replace(
  /<script\s+src=["']dist\/bundle\.js["']\s*><\/script>/i,
  `<script>\n${bundleJs}\n</script>`
);

// Write the self-contained version back to index.html
try {
  writeFileSync(indexPath, offlineHtml, 'utf-8');
} catch (error) {
  console.error(`❌ Error writing output file: ${error.message}`);
  process.exit(1);
}

console.log(`✅ Game built successfully!`);
console.log(`📁 Output: index.html (self-contained with inline CSS and JS)`);
console.log(`\n🎮 To play: Simply open index.html in your browser - no server needed!`);

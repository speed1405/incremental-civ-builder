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

// Check if we have a template with external references or an already-built file
const hasExternalCss = /<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']\s*\/?>/i.test(offlineHtml);
const hasExternalJs = /<script\s+src=["']dist\/bundle\.js["']\s*><\/script>/i.test(offlineHtml);

if (hasExternalCss) {
  // Replace external CSS link with inline styles
  offlineHtml = offlineHtml.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']\s*\/?>/i,
    `<style>\n${stylesCss}\n</style>`
  );
} else {
  // Replace existing inline styles with updated styles
  offlineHtml = offlineHtml.replace(
    /<style>[\s\S]*?<\/style>/i,
    `<style>\n${stylesCss}\n</style>`
  );
}

if (hasExternalJs) {
  // Replace external JS script with inline script
  offlineHtml = offlineHtml.replace(
    /<script\s+src=["']dist\/bundle\.js["']\s*><\/script>/i,
    `<script>\n${bundleJs}\n</script>`
  );
} else {
  // Replace existing inline script with updated script
  // Use a more specific pattern to match only the main game script (not inline event handlers)
  // The main script starts with "use strict" and contains a self-invoking function
  offlineHtml = offlineHtml.replace(
    /<script>\s*"use strict";[\s\S]*?<\/script>\s*<\/body>/i,
    `<script>\n${bundleJs}\n</script>\n</body>`
  );
}

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

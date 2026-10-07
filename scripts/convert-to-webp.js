/**
 * convert-to-webp.js
 * Converts every JPG, PNG, and WEBP (re-encodes) in /public/images
 * to compressed WebP files IN-PLACE (original is deleted, .webp is saved).
 *
 * Run with: node scripts/convert-to-webp.js
 */

import sharp from 'sharp';
import { readdir, stat, unlink, rename } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');
const QUALITY = 82; // 80-85 is the sweet spot: visually lossless but small
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp']);

let converted = 0;
let skipped = 0;
let savedBytes = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (SUPPORTED.has(ext)) {
        await convertFile(fullPath, ext);
      }
    }
  }
}

async function convertFile(srcPath, ext) {
  const destPath = srcPath.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');

  try {
    const srcStats = await stat(srcPath);
    const srcSize = srcStats.size;

    await sharp(srcPath)
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(destPath + '.tmp');

    const destStats = await stat(destPath + '.tmp');
    const destSize = destStats.size;
    const saved = srcSize - destSize;

    if (destSize < srcSize || ext !== '.webp') {
      // Replace original with the new webp
      if (ext !== '.webp') {
        await unlink(srcPath); // remove original JPG/PNG
      }
      await rename(destPath + '.tmp', destPath); // rename .tmp → .webp
      savedBytes += saved;
      converted++;
      const pct = ((saved / srcSize) * 100).toFixed(1);
      const savedKB = (saved / 1024).toFixed(0);
      console.log(`✅ ${basename(srcPath)} → ${basename(destPath)}  -${savedKB}KB (${pct}%)`);
    } else {
      // Webp was bigger (rare, only for very small optimized PNGs), keep original
      await unlink(destPath + '.tmp');
      skipped++;
      console.log(`⏭️  ${basename(srcPath)} — already optimal, kept original`);
    }
  } catch (err) {
    await unlink(destPath + '.tmp').catch(() => {});
    console.error(`❌ Error converting ${basename(srcPath)}: ${err.message}`);
    skipped++;
  }
}

console.log('🚀 ByJosh WebP Converter — Starting...\n');
const startTime = Date.now();

walk(IMAGES_DIR)
  .then(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const savedMB = (savedBytes / 1024 / 1024).toFixed(1);
    console.log(`\n✨ Done in ${elapsed}s`);
    console.log(`   Converted: ${converted} files`);
    console.log(`   Skipped:   ${skipped} files`);
    console.log(`   Saved:     ${savedMB} MB total`);
  })
  .catch(console.error);

/**
 * optimize-images.js
 * ------------------------------------------------------------------
 * Generates lightweight, visually-equivalent derivatives WITHOUT touching
 * the original files:
 *
 *   1. Animated GIF  ->  animated WebP  (same frames, same look, ~70-90% lighter)
 *      public/images/foo.gif  ->  public/images/foo.anim.webp
 *      (resized to ~2x its on-screen size so it stays crisp on retina screens)
 *
 *   2. Gallery thumbnails for the Projects grid
 *      public/images/<folder>/<file>.webp  ->  public/images/thumbs/<folder>/<file>.webp
 *      (the grid shows cards ~370px wide; the lightbox still opens the original)
 *
 * The script is idempotent: files are only regenerated when the source is newer.
 * Run it whenever you add new images:   npm run optimize:images
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');
const THUMBS_DIR = join(IMAGES_DIR, 'thumbs');

// Folders whose images appear in the Projects gallery grid
const GALLERY_FOLDERS = [
  'GD thumbnails',
  'E-SPORTS',
  'Headers',
  'Banners',
  'AVIS',
  'Discord Banners',
  'Anime-Backgrounds',
];

const THUMB_WIDTH = 720; // ~2x the widest card on desktop / 1-col mobile
const THUMB_QUALITY = 80;

// GIF -> animated WebP, with a max width ≈ 2x the largest on-screen size
const GIFS = {
  'haimiya.gif': 704, // hero (380px wide on desktop) – keep native resolution
  'senpai-mio.gif': 360, // about (≤320px)
  'superbad-whats-up.gif': 440, // about (≤220px)
  'haimiya-anime.gif': 498, // about (≤280px)
  'haimiya-senpai-haimiya.gif': 420, // contact (≤210px)
  'remielle.gif': 374, // contact (≤180px)
  'reze-danza-reze-dance.gif': 498, // not used currently, converted for future use
};

let made = 0;
let skipped = 0;
let before = 0;
let after = 0;

async function isFresh(src, dest) {
  try {
    const [s, d] = await Promise.all([stat(src), stat(dest)]);
    return d.mtimeMs >= s.mtimeMs;
  } catch {
    return false;
  }
}

function kb(n) {
  return `${(n / 1024).toFixed(0)}KB`;
}

async function convertGif(name, maxWidth) {
  const src = join(IMAGES_DIR, name);
  const dest = src.replace(/\.gif$/i, '.anim.webp');
  try {
    await stat(src);
  } catch {
    return;
  }
  if (await isFresh(src, dest)) {
    skipped++;
    return;
  }

  const meta = await sharp(src, { animated: true }).metadata();
  let pipeline = sharp(src, { animated: true, limitInputPixels: false });
  if (meta.width > maxWidth) pipeline = pipeline.resize({ width: maxWidth });
  await pipeline
    .webp({ quality: 78, effort: 3, loop: 0 })
    .toFile(dest);

  const [s, d] = await Promise.all([stat(src), stat(dest)]);
  before += s.size;
  after += d.size;
  made++;
  console.log(`GIF  ${name}  ${kb(s.size)} -> ${kb(d.size)}`);
}

async function makeThumb(src) {
  const rel = relative(IMAGES_DIR, src);
  const dest = join(THUMBS_DIR, rel).replace(/\.(png|jpe?g|webp)$/i, '.webp');
  if (await isFresh(src, dest)) {
    skipped++;
    return;
  }
  await mkdir(dirname(dest), { recursive: true });

  const img = sharp(src, { limitInputPixels: false });
  const meta = await img.metadata();
  const pipeline = meta.width > THUMB_WIDTH ? img.resize({ width: THUMB_WIDTH }) : img;
  await pipeline.webp({ quality: THUMB_QUALITY, effort: 3 }).toFile(dest);

  const [s, d] = await Promise.all([stat(src), stat(dest)]);
  before += s.size;
  after += d.size;
  made++;
  console.log(`THUMB ${rel}  ${kb(s.size)} -> ${kb(d.size)}`);
}

async function collectFiles(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await collectFiles(full, files);
    else if (extname(e.name).toLowerCase() === '.webp') files.push(full);
  }
  return files;
}

const t0 = Date.now();
console.log('ByJosh image optimizer — starting...\n');

for (const [name, w] of Object.entries(GIFS)) {
  await convertGif(name, w).catch((err) => console.error(`ERR ${name}: ${err.message}`));
}

const allThumbFiles = [];
for (const folder of GALLERY_FOLDERS) {
  await collectFiles(join(IMAGES_DIR, folder), allThumbFiles);
}

// Process thumbnails in batches of 6 concurrently
const BATCH_SIZE = 6;
for (let i = 0; i < allThumbFiles.length; i += BATCH_SIZE) {
  const batch = allThumbFiles.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map((f) => makeThumb(f).catch((e) => console.error(`ERR thumb: ${e.message}`))));
}

console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s — generated ${made}, up-to-date ${skipped}`);
if (made) console.log(`Sources ${(before / 1048576).toFixed(1)}MB -> derivatives ${(after / 1048576).toFixed(1)}MB`);

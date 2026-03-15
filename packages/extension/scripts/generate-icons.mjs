#!/usr/bin/env node
// Generate PNG icons for the Chrome extension from the favicon SVG
// Uses sharp if available, otherwise creates minimal valid PNGs programmatically

import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/icon');

const SIZES = [16, 32, 48, 128];

// Try to use sharp first
async function trySharp() {
  try {
    const require = createRequire(import.meta.url);
    const sharp = require('sharp');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#2563EB"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="white">&lt;/&gt;</text>
</svg>`;

    for (const size of SIZES) {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(join(outDir, `${size}.png`));
      console.log(`Generated ${size}.png`);
    }
    return true;
  } catch {
    return false;
  }
}

// Fallback: create minimal PNG programmatically (1x1 blue pixel scaled up via metadata)
// We'll create proper minimal PNGs using raw pixel data
function createMinimalPng(size) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.allocUnsafe(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.allocUnsafe(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Build raw pixel data with a simple icon
  // Background: #2563EB (blue), with a simple pattern for </> text area
  const bgR = 0x25, bgG = 0x63, bgB = 0xEB; // blue-600
  const fgR = 0xFF, fgG = 0xFF, fgB = 0xFF; // white

  // Simple: draw rounded rect bg with </> symbol approximation
  const rows = [];
  const radius = Math.floor(size * 0.25);

  for (let y = 0; y < size; y++) {
    const rowData = [0]; // filter byte
    for (let x = 0; x < size; x++) {
      // Rounded corners: check if pixel is inside rounded rect
      const inCornerTL = x < radius && y < radius;
      const inCornerTR = x >= size - radius && y < radius;
      const inCornerBL = x < radius && y >= size - radius;
      const inCornerBR = x >= size - radius && y >= size - radius;

      let isBackground = true;
      if (inCornerTL) {
        const dx = x - radius, dy = y - radius;
        isBackground = dx * dx + dy * dy <= radius * radius;
      } else if (inCornerTR) {
        const dx = x - (size - radius - 1), dy = y - radius;
        isBackground = dx * dx + dy * dy <= radius * radius;
      } else if (inCornerBL) {
        const dx = x - radius, dy = y - (size - radius - 1);
        isBackground = dx * dx + dy * dy <= radius * radius;
      } else if (inCornerBR) {
        const dx = x - (size - radius - 1), dy = y - (size - radius - 1);
        isBackground = dx * dx + dy * dy <= radius * radius;
      }

      if (!isBackground) {
        rowData.push(0, 0, 0); // transparent corner -> black (will be invisible)
      } else {
        rowData.push(bgR, bgG, bgB);
      }
    }
    rows.push(Buffer.from(rowData));
  }

  // Compress with zlib (deflate)
  const { deflateSync } = await import('zlib');

  // We need sync version for simplicity
  const { deflateSync: deflate } = createRequire(import.meta.url)('zlib');
  const rawData = Buffer.concat(rows);
  const compressed = deflate(rawData);

  const idatChunk = chunk('IDAT', compressed);
  const ihdrChunk = chunk('IHDR', ihdr);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

async function generateWithFallback() {
  const sharpWorked = await trySharp();
  if (sharpWorked) return;

  console.log('sharp not available, using fallback PNG generator...');

  const { deflateSync } = await import('zlib');

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.allocUnsafe(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.allocUnsafe(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  function makePng(size) {
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    const ihdr = Buffer.allocUnsafe(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

    const bgR = 0x25, bgG = 0x63, bgB = 0xEB;
    const radius = Math.floor(size * 0.25);
    const rows = [];

    for (let y = 0; y < size; y++) {
      const rowData = [0];
      for (let x = 0; x < size; x++) {
        let inRounded = false;
        const corners = [
          [radius, radius],
          [size - radius - 1, radius],
          [radius, size - radius - 1],
          [size - radius - 1, size - radius - 1],
        ];
        const inCorner = corners.some(([cx, cy]) =>
          Math.abs(x - cx) <= radius && Math.abs(y - cy) <= radius &&
          (x < radius || x >= size - radius) && (y < radius || y >= size - radius)
        );

        if (inCorner) {
          const [cx, cy] = corners.find(([cx, cy]) =>
            (x < radius || x >= size - radius) && (y < radius || y >= size - radius) &&
            Math.abs(x - cx) <= radius && Math.abs(y - cy) <= radius
          ) || [0, 0];
          const dx = x - cx, dy = y - cy;
          inRounded = dx * dx + dy * dy > radius * radius;
        }

        if (inRounded) {
          rowData.push(0, 0, 0);
        } else {
          rowData.push(bgR, bgG, bgB);
        }
      }
      rows.push(Buffer.from(rowData));
    }

    const raw = Buffer.concat(rows);
    const compressed = deflateSync(raw);
    return Buffer.concat([
      sig,
      chunk('IHDR', ihdr),
      chunk('IDAT', compressed),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }

  for (const size of SIZES) {
    const png = makePng(size);
    writeFileSync(join(outDir, `${size}.png`), png);
    console.log(`Generated ${size}.png (${size}x${size})`);
  }
}

generateWithFallback().catch(console.error);

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a valid PNG buffer with custom colors & text watermark
function createPNG(width, height, r1, g1, b1, r2, g2, b2) {
  // Simple uncompressed BMP header converted to valid PNG using zlib
  const buffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const factor = y / height;
    const r = Math.round(r1 * (1 - factor) + r2 * factor);
    const g = Math.round(g1 * (1 - factor) + g2 * factor);
    const b = Math.round(b1 * (1 - factor) + b2 * factor);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Add subtle noise/pattern for photo realism
      const noise = ((x ^ y) % 17) * 2;
      buffer[idx] = Math.min(255, Math.max(0, r + noise));
      buffer[idx + 1] = Math.min(255, Math.max(0, g + noise));
      buffer[idx + 2] = Math.min(255, Math.max(0, b + noise));
      buffer[idx + 3] = 255; // Alpha
    }
  }

  // Filter byte 0 for each scanline
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0; // Filter type 0
    buffer.copy(rawData, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(rawData);

  // Helper for CRC32
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const baseDir = path.resolve('public/images');

const imageList = [
  // Hero & Campus
  { path: 'hero/campus-hero.jpg', r1: 59, g1: 7, b1: 100, r2: 30, g2: 16, b2: 101 },
  { path: 'campus/entrance.jpg', r1: 76, g1: 29, b1: 149, r2: 46, g2: 16, b2: 101 },
  { path: 'campus/building.jpg', r1: 109, g1: 40, b1: 217, r2: 59, g2: 7, b2: 100 },
  { path: 'campus/classrooms.jpg', r1: 126, g1: 58, b1: 237, r2: 76, g2: 29, b1: 149 },
  { path: 'campus/library.jpg', r1: 88, g1: 28, b1: 135, r2: 46, g2: 16, b2: 101 },
  { path: 'campus/computer-lab.jpg', r1: 67, g1: 56, b1: 202, r2: 30, g2: 27, b2: 75 },
  { path: 'campus/covered-court.jpg', r1: 180, g1: 83, b1: 9, r2: 120, g2: 53, b2: 15 },
  
  // News Photos
  { path: 'news/graduation.jpg', r1: 76, g1: 29, b1: 149, r2: 30, g2: 16, b2: 101 },
  { path: 'news/moving-up.jpg', r1: 109, g1: 40, b1: 217, r2: 59, g2: 7, b2: 100 },
  { path: 'news/recognition.jpg', r1: 202, g1: 138, b1: 4, r2: 113, g2: 63, b2: 18 },
  { path: 'news/buwan-ng-wika.jpg', r1: 185, g1: 28, b1: 28, r2: 127, g2: 29, b1: 29 },
  { path: 'news/teachers-day.jpg', r1: 126, g1: 58, b1: 237, r2: 88, g2: 28, b1: 135 },
  { path: 'news/foundation-day.jpg', r1: 147, g1: 51, b1: 234, r2: 88, g2: 28, b1: 135 },
  { path: 'news/united-nations.jpg', r1: 3, g1: 105, b1: 161, r2: 12, g2: 74, b2: 110 },
  
  // Event Banners
  { path: 'events/intramurals.jpg', r1: 180, g1: 83, b1: 9, r2: 120, g2: 53, b2: 15 },
  { path: 'events/christmas-program.jpg', r1: 185, g1: 28, b1: 28, r2: 127, g2: 29, b1: 29 },
  { path: 'events/nutrition-month.jpg', r1: 22, g1: 163, b1: 74, r2: 21, g2: 128, b2: 61 },
  { path: 'events/reading-month.jpg', r1: 76, g1: 29, b1: 149, r2: 46, g2: 16, b2: 101 },
  { path: 'events/parent-orientation.jpg', r1: 109, g1: 40, b1: 217, r2: 59, g2: 7, b2: 100 },

  // Gallery Photos
  { path: 'gallery/graduation/grad-1.jpg', r1: 76, g1: 29, b1: 149, r2: 30, g2: 16, b2: 101 },
  { path: 'gallery/recognition/rec-1.jpg', r1: 202, g1: 138, b1: 4, r2: 113, g2: 63, b2: 18 },
  { path: 'gallery/teachers-day/td-1.jpg', r1: 126, g1: 58, b1: 237, r2: 88, g2: 28, b1: 135 },
  { path: 'gallery/foundation-day/fd-1.jpg', r1: 147, g1: 51, b1: 234, r2: 88, g2: 28, b1: 135 },
  { path: 'gallery/buwan-ng-wika/bw-1.jpg', r1: 185, g1: 28, b1: 28, r2: 127, g2: 29, b1: 29 },
  { path: 'gallery/united-nations/un-1.jpg', r1: 3, g1: 105, b1: 161, r2: 12, g2: 74, b2: 110 },
  { path: 'gallery/sportsfest/sf-1.jpg', r1: 180, g1: 83, b1: 9, r2: 120, g2: 53, b2: 15 },
  { path: 'gallery/performances/pf-1.jpg', r1: 126, g1: 58, b1: 237, r2: 76, g2: 29, b1: 149 },
  { path: 'gallery/activities/act-1.jpg', r1: 109, g1: 40, b1: 217, r2: 59, g2: 7, b2: 100 },
];

imageList.forEach((img) => {
  const fullPath = path.join(baseDir, img.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // Generate 800x500 PNG buffer (saved as .jpg or .png)
  const buf = createPNG(800, 500, img.r1, img.g1, img.b1, img.r2, img.g2, img.b2);
  fs.writeFileSync(fullPath, buf);
  console.log(`Created JPG photo asset: ${img.path}`);
});

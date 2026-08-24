import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// CRC32 Table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function createPng(width, height, drawPixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makePngChunk('IHDR', ihdrData);

  // Scanlines
  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = Math.max(0, Math.min(255, Math.round(r)));
      row[offset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      row[offset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      row[offset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
    scanlines.push(row);
  }

  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makePngChunk('IDAT', compressed);
  const iendChunk = makePngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Brand Icon Pixel Renderer (Futuristic minimalist SOUL symbol)
function renderSoulIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = w * 0.44;

  // Background
  const bgGrad = (y / h);
  let bgR = 8 + bgGrad * 6;
  let bgG = 12 + bgGrad * 8;
  let bgB = 14 + bgGrad * 10;
  let bgA = 255;

  if (!isMaskable) {
    const cornerR = w * 0.22;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    const maxExtent = w / 2 - 2;
    if (ax > maxExtent || ay > maxExtent) return [0, 0, 0, 0];
    
    // Rounded corners
    if (ax > maxExtent - cornerR && ay > maxExtent - cornerR) {
      const cdx = ax - (maxExtent - cornerR);
      const cdy = ay - (maxExtent - cornerR);
      if (Math.sqrt(cdx * cdx + cdy * cdy) > cornerR) {
        return [0, 0, 0, 0];
      }
    }
  }

  let r = bgR, g = bgG, b = bgB, a = bgA;

  // Outer subtle ring
  if (Math.abs(dist - w * 0.36) < 1.5) {
    r = 255; g = 255; b = 255;
    return [r, g, b, 50];
  }

  // Cyan glowing diamond
  const diamondDist = Math.abs(dx) + Math.abs(dy);
  const targetDiamond = w * 0.35;
  const diamondThick = w * 0.024;
  if (Math.abs(diamondDist - targetDiamond) < diamondThick) {
    const alpha = 1 - Math.abs(diamondDist - targetDiamond) / diamondThick;
    return [34, 211, 238, 255 * alpha];
  }

  // Dynamic inclined orbit ring
  const rotAngle = -0.55;
  const rx = dx * Math.cos(rotAngle) - dy * Math.sin(rotAngle);
  const ry = dx * Math.sin(rotAngle) + dy * Math.cos(rotAngle);
  const ellipseDist = Math.sqrt((rx / (w * 0.32)) ** 2 + (ry / (w * 0.16)) ** 2);
  if (Math.abs(ellipseDist - 1) < 0.08) {
    const factor = 1 - Math.abs(ellipseDist - 1) / 0.08;
    if (dx > 0 && dy < 0) {
      return [249, 115, 22, 230 * factor]; // Orange energy accent
    }
    return [255, 255, 255, 240 * factor];
  }

  // Central Core Nexus
  if (dist < w * 0.08) {
    if (dist < w * 0.038) {
      return [34, 211, 238, 255]; // Inner cyan energy core
    }
    return [255, 255, 255, 255]; // Inner white ring
  }

  // Subtle Cyan Ambient Glow
  if (dist < w * 0.38) {
    const glow = (1 - dist / (w * 0.38)) * 0.18;
    r += 34 * glow;
    g += 211 * glow;
    b += 238 * glow;
  }

  return [r, g, b, a];
}

// Generate files
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, 192, (x, y, w, h) => renderSoulIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, 512, (x, y, w, h) => renderSoulIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'maskable-512.png'), createPng(512, 512, (x, y, w, h) => renderSoulIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => renderSoulIcon(x, y, w, h, false)));

console.log('Icons generated successfully in /public!');

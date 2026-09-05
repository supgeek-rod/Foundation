// 零依赖生成 PWA 图标：渐变圆角方块 + 白色时钟（与 public/favicon.svg 同款）
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const SIZE = Number(process.argv[2] ?? 512)
const OUT = process.argv[3] ?? `pwa-${SIZE}x${SIZE}.png`

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const sdRoundRect = (px, py, half, r) => {
  const qx = Math.abs(px) - (half - r)
  const qy = Math.abs(py) - (half - r)
  const ax = Math.max(qx, 0)
  const ay = Math.max(qy, 0)
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r
}
const sdSegment = (px, py, ax, ay, bx, by) => {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const t = clamp01((apx * abx + apy * aby) / (abx * abx + aby * aby))
  return Math.hypot(apx - abx * t, apy - aby * t)
}
const lerp = (a, b, t) => a + (b - a) * t

function sample(nx, ny) {
  // 与 SVG 一致：inset 1/16，圆角 1/4，对角渐变 #6366f1 → #22d3ee
  const dRect = sdRoundRect(nx - 0.5, ny - 0.5, 0.5 - 0.0625, 0.25)
  if (dRect >= 0) return [0, 0, 0, 0]
  const t = clamp01((nx + ny) / 2)
  let r = lerp(0x63, 0x22, t)
  let g = lerp(0x66, 0xd3, t)
  let b = lerp(0xf1, 0xee, t)
  // 白色时钟：圆环 + 指针
  const ring = Math.abs(Math.hypot(nx - 0.5, ny - 0.5) - 0.265) - 0.031
  const handV = sdSegment(nx, ny, 0.5, 0.5, 0.5, 0.345) - 0.031
  const handH = sdSegment(nx, ny, 0.5, 0.5, 0.61, 0.425) - 0.031
  const dWhite = Math.min(ring, handV, handH)
  if (dWhite < 0) {
    r = 255
    g = 255
    b = 255
  }
  // 边缘 1px 抗锯齿
  const alpha = clamp01(-dRect * SIZE)
  return [r, g, b, alpha * 255]
}

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  const rowStart = y * (SIZE * 4 + 1)
  raw[rowStart] = 0
  for (let x = 0; x < SIZE; x++) {
    // 2x2 超采样
    let r = 0, g = 0, b = 0, a = 0
    for (const [ox, oy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
      const [cr, cg, cb, ca] = sample((x + ox) / SIZE, (y + oy) / SIZE)
      r += cr; g += cg; b += cb; a += ca
    }
    const o = rowStart + 1 + x * 4
    raw[o] = Math.round(r / 4)
    raw[o + 1] = Math.round(g / 4)
    raw[o + 2] = Math.round(b / 4)
    raw[o + 3] = Math.round(a / 4)
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])
writeFileSync(OUT, png)
console.log('wrote', OUT, `${SIZE}x${SIZE}`)

export function generateVisuallyDistinctPalette(count: number, seed = Date.now()): string[] {
  const rng = mulberry32(seed)
  const colors: string[] = []
  const used: [number, number, number][] = []

  for (let i = 0; i < count * 3; i++) {
    const h = rng() * 360
    const s = 65 + rng() * 30 
    const l = 40 + rng() * 30 
    const rgb = hslToRgb(h, s / 100, l / 100)
    const lab = rgbToLab(rgb)

    if (used.every(u => colorDistanceLab(u, lab) > 3)) {
      colors.push(`hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`)
      used.push(lab)
      if (colors.length >= count) break
    }
  }

  return colors
}



function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
  }
  return [f(0), f(8), f(4)]
}

function rgbToLab([r, g, b]: [number, number, number]): [number, number, number] {
  // normalize
  r /= 255; g /= 255; b /= 255
  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + 16 / 116)
  const L = 116 * f(y) - 16
  const a = 500 * (f(x) - f(y))
  const b2 = 200 * (f(y) - f(z))
  return [L, a, b2]
}

function colorDistanceLab(a: [number, number, number], b: [number, number, number]) {
  const dL = a[0] - b[0]
  const dA = a[1] - b[1]
  const dB = a[2] - b[2]
  return Math.sqrt(dL * dL + dA * dA + dB * dB)
}

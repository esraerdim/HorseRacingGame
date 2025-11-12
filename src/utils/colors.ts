const GOLDEN_RATIO_CONJUGATE = 0.618033988749895

export function generateVisuallyDistinctPalette(count: number, seed = Date.now()): string[] {
  const rng = mulberry32(seed)
  const colors: string[] = []

  let hue = rng()

  for (let i = 0; i < count; i++) {
    hue = (hue + GOLDEN_RATIO_CONJUGATE) % 1

    const h = hue * 360
    const s = 60 + rng() * 20
    const l = 45 + rng() * 15

    colors.push(hslToHex(h, s, l))
  }

  return colors
}

function hslToHex(h: number, s: number, l: number): string {
  const saturation = Math.max(0, Math.min(100, s)) / 100
  const lightness = Math.max(0, Math.min(100, l)) / 100

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lightness - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0]
  else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0]
  else if (h >= 120 && h < 180) [r, g, b] = [0, c, x]
  else if (h >= 180 && h < 240) [r, g, b] = [0, x, c]
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

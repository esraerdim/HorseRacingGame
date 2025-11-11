import { SeededRandom, DEFAULT_SEED } from './random'

const GOLDEN_RATIO_CONJUGATE = 0.61803398875

const hueToHsl = (hue: number, saturation = 70, lightness = 50) =>
  `hsl(${Math.round(hue * 360)}, ${saturation}%, ${lightness}%)`

export interface PaletteOptions {
  saturation?: number
  lightness?: number
  seed?: number
}

export const generateDistinctColorPalette = (
  count: number,
  options: PaletteOptions = {},
): string[] => {
  const { saturation = 70, lightness = 50, seed = DEFAULT_SEED } = options
  const rng = new SeededRandom(seed)
  const colors: string[] = []
  let hue = rng.next()

  for (let i = 0; i < count; i += 1) {
    hue = (hue + GOLDEN_RATIO_CONJUGATE) % 1
    colors.push(hueToHsl(hue, saturation, lightness))
  }

  return colors
}


export const DEFAULT_SEED = 123456789

export class SeededRandom {
  private seed: number

  constructor(seed: number = DEFAULT_SEED) {
    this.seed = seed
  }

  next(): number {
    // LCG parameters from Numerical Recipes
    const a = 1664525
    const c = 1013904223
    const m = 2 ** 32

    this.seed = (a * this.seed + c) % m
    return this.seed / m
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1))
      const current = result[i]
      const candidate = result[j]
      if (current === undefined || candidate === undefined) {
        continue
      }
      result[i] = candidate
      result[j] = current
    }
    return result
  }

  pick<T>(arr: T[], count: number): T[] {
    if (count >= arr.length) {
      return [...arr]
    }
    return this.shuffle(arr).slice(0, count)
  }
}


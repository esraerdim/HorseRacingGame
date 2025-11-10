import type { Horse } from './horse'

export interface RoundConfig {
  roundNumber: number
  distance: number
  horses: Horse[]
}

export interface RoundAssignment {
  roundNumber: number
  distance: number
  horseIds: number[]
}

export interface RaceResultEntry {
  position: number
  horseId: number
  elapsedMs: number
}

export interface RoundResult {
  roundNumber: number
  entries: RaceResultEntry[]
}

export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished'


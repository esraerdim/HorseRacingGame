export interface RaceRound {
  roundNumber: number
  distance: number
  horseIds: number[]
}

export interface RaceResultEntry {
  position: number
  horseId: number
  elapsedMs: number
}

export interface RaceRoundResult {
  roundNumber: number
  entries: RaceResultEntry[]
}

export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'awaiting' | 'finished'


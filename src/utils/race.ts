import type { Horse, RaceRound, RaceRoundResult } from '@/types'
import {
  ROUND_DISTANCES,
  RACE_HORSES_PER_ROUND,
} from '@/config/race-config'
import { SeededRandom } from './random'

export interface ScheduleGenerationInput {
  horses: Horse[]
  seed: number
}

export const generateRaceSchedule = ({
  horses,
  seed,
}: ScheduleGenerationInput): RaceRound[] => {
  const rng = new SeededRandom(seed)
  const totalRounds = ROUND_DISTANCES.length
  const schedule: RaceRound[] = []

  for (let i = 0; i < totalRounds; i += 1) {
    const shuffled = rng.shuffle(horses.map((horse) => horse.id))
    const selected = shuffled.slice(0, RACE_HORSES_PER_ROUND)
    const distance = ROUND_DISTANCES[i]

    if (distance === undefined) {
      throw new Error(`Missing distance configuration for round ${i + 1}`)
    }

    schedule.push({
      roundNumber: i + 1,
      distance,
      horseIds: selected,
    })
  }

  return schedule
}

export interface ResultSimulationInput {
  assignment: RaceRound
  horses: Horse[]
  seed: number
}

export const simulateRoundResult = ({
  assignment,
  horses,
  seed,
}: ResultSimulationInput): RaceRoundResult => {
  const rng = new SeededRandom(seed)
  const participants = assignment.horseIds
    .map((horseId) => horses.find((horse) => horse.id === horseId))
    .filter((horse): horse is Horse => Boolean(horse))

  const baseTimeMs = assignment.distance * 10

  const entries = participants.map((horse) => {
    const conditionFactor = (horse.condition - 50) / 200 // range [-0.25, 0.25]
    const randomFactor = (rng.next() - 0.5) * 0.2 // range [-0.1, 0.1]
    const timeMultiplier = 1 - conditionFactor - randomFactor
    const elapsedMs = Math.max(baseTimeMs * timeMultiplier, baseTimeMs * 0.7)

    return {
      position: 0,
      horseId: horse.id,
      elapsedMs,
    }
  })

  const sorted = entries
    .sort((a, b) => a.elapsedMs - b.elapsedMs)
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }))

  return {
    roundNumber: assignment.roundNumber,
    entries: sorted,
  }
}


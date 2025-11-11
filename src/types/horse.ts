export interface Horse {
  id: number
  name: string
  color: string
  condition: number
}

export interface HorsePoolConfig {
  totalHorses: number
  minCondition: number
  maxCondition: number
}


import { FLOOR_TYPES, LEASED, PROJECT, ZONES } from './project'
import type { FloorType, LayoutId, PresetId, Unit, Zone } from './types'

/** 27 → 1 */
export const FLOORS = Array.from({ length: PROJECT.totalFloors }, (_, i) => PROJECT.totalFloors - i)

export const typeOf = (f: number): FloorType => (f === 1 ? 'f1' : f === 2 ? 'f2' : 'std')

export const zoneOf = (f: number): Zone =>
  ZONES.find((z) => f >= z.range[0] && f <= z.range[1]) ?? ZONES[0]

export const unitsOf = (f: number): Unit[] =>
  FLOOR_TYPES[typeOf(f)].units.map((u) => ({ ...u, occ: LEASED.has(`${f}-${u.id}`) }))

export const freeCount = (f: number) => unitsOf(f).filter((u) => !u.occ).length

export const tally = () => {
  let free = 0
  let occ = 0
  FLOORS.forEach((f) => unitsOf(f).forEach((u) => (u.occ ? occ++ : free++)))
  return { free, occ }
}

/** 該樓層要顯示的規劃：1F/2F 固定，標準層看使用者有沒有手動切換 */
export const layoutFor = (f: number, override: PresetId | null): LayoutId => {
  const t = typeOf(f)
  if (t === 'f1') return 'cafe'
  if (t === 'f2') return 'hall'
  return override ?? zoneOf(f).def
}

/** 進站預設：10F 以下第一個整層可租的樓層 */
export const DEFAULT_FLOOR =
  FLOORS.find((f) => f <= 9 && freeCount(f) === unitsOf(f).length) ?? FLOORS[0]

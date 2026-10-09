export type Side = 'L' | 'R'
export type FloorType = 'std' | 'f2' | 'f1'
export type PresetId = 'study' | 'class' | 'studio' | 'office'
export type LayoutId = PresetId | 'hall' | 'cafe'

export interface Zone {
  id: string
  name: string
  /** [最低樓層, 最高樓層] */
  range: [number, number]
  /** 此分區預設的空間規劃 */
  def: LayoutId
  desc: string
}

export interface UnitDef {
  id: string
  /** L = 河北二路 91 巷側（轉角），R = 建國三路側 */
  side: Side
  /** 坪 */
  area: number
  note: string
}

export interface Unit extends UnitDef {
  occ: boolean
}

export interface ZonePin {
  name: string
  sub?: string
}

export interface FloorStats {
  /** 各戶的規劃摘要（已出租的戶沒有） */
  plan: Partial<Record<Side, string>>
  /** 圖例：3D 上 ①②③ 對應的空間 */
  zones: ZonePin[]
}

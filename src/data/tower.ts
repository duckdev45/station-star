import polys from './tower-polys.json'

/** 外觀圖（1x 座標）寬高，與 tools/tower-cutout 輸出一致 */
export const TOWER_IMG = { w: polys.w, h: polys.h }
/** SVG viewBox：右側多留空間給抽出的樓層 */
export const VB = { x: 0, y: -6, w: 312, h: 932 }
/** 每層右緣的平均高度（1x 座標），用來決定樓層列的行高 */
export const FLOOR_PITCH = 28.6

export interface TowerFloor {
  floor: number
  points: string
  /** 右緣中點 y（1x 座標） */
  midY: number
}

export const TOWER_FLOORS: TowerFloor[] = polys.polys.map((p) => ({
  floor: p.floor,
  points: p.pts.map((q) => q.join(',')).join(' '),
  midY: (p.rightY[0] + p.rightY[1]) / 2,
}))

export const towerFloor = (f: number) => TOWER_FLOORS.find((t) => t.floor === f)!

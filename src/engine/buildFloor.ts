/* 組一整層：樓板、立面、核心（梯廳／電梯／樓梯／廁所／茶水間），再依規劃放入兩戶的配置 */
import * as THREE from 'three'
import type { FloorStats, FloorType, LayoutId, Side, Unit } from '../data/types'
import { K, seed, WH } from './kit'
import { LAYOUTS } from './layouts'
import { mergeStatic } from './merge'
import { add, extrude, facade, floorPlane, glass, local, roundRect, unitRect, UNIT, wall, type Gaps, type Label } from './primitives'

export interface BuiltFloor {
  group: THREE.Group
  labels: Label[]
  stats: FloorStats
  picks: THREE.Mesh[]
  rings: Partial<Record<Side, THREE.Group>>
}

export function buildFloor(type: FloorType, layout: LayoutId, units: Unit[]): BuiltFloor {
  const { M, BOX, LINE } = K()
  seed(21)
  const g = new THREE.Group()
  const labels: Label[] = []
  const picks: THREE.Mesh[] = []
  const rings: BuiltFloor['rings'] = {}
  const stats: FloorStats = { plan: {}, zones: [] }
  const unitOf = (side: Side) => units.find((u) => u.side === side)!

  // 樓板與奶油色弧形陽台（呼應外觀）
  add(g, BOX, M.slab, 10, -0.18, 6.7, 20, 0.36, 13.4)
  extrude(g, roundRect(-0.95, 12.9, 20.95, 32.15, 1.8, 0.4), 0.36, -0.36, M.slab)
  const rim = roundRect(-0.95, 12.9, 20.95, 32.15, 1.8, 0.4)
  rim.holes.push(roundRect(-0.8, 13.05, 20.8, 32.0, 1.65, 0.3))
  extrude(g, rim, 0.28, 0, M.slab)
  floorPlane(g, 0.08, 0.08, 19.92, 13.45, M.tile, 1.2)
  floorPlane(g, 0.08, 13.45, 19.92, 31.12, M.wood, 2.4)
  for (const side of ['L', 'R'] as Side[]) {
    if (!unitOf(side).occ) continue
    const r = unitRect(side)
    floorPlane(g, r.x0, r.z0, r.x1, r.z1, M.greyFloor, 2.4, 0.016)
  }

  // 立面、分戶牆（2F 用玻璃表示可打通）
  const sill = type === 'f1' ? 0 : 0.9
  facade(g, 0.1, 13.45, 0.1, 31.1, sill)
  facade(g, 0.1, 31.1, 19.9, 31.1, sill)
  facade(g, 19.9, 13.45, 19.9, 31.1, sill)
  if (type === 'f2') glass(g, 10.5, 13.45, 10.5, 31.0)
  else wall(g, 10.5, 13.45, 10.5, 31.0, [], 0.2)

  // 核心
  wall(g, 0.1, 0.1, 0.1, 13.45, [], 0.2)
  wall(g, 0.1, 0.1, 19.9, 0.1, [], 0.2)
  wall(g, 19.9, 0.1, 19.9, 13.45, [], 0.2)
  wall(g, 5.0, 13.45, 13.2, 13.45, [[3.6, 4.8], [6.2, 7.4]], 0.2) // 兩戶入口
  wall(g, 0.1, 13.45, 5.0, 13.45, [], 0.2)
  wall(g, 13.2, 13.45, 19.9, 13.45, [], 0.2)
  // 茶水間
  wall(g, 3.4, 0.1, 3.4, 8.6)
  wall(g, 0.1, 8.6, 3.4, 8.6, [[1.0, 1.95]])
  add(g, BOX, M.oak, 0.5, 0.45, 4.2, 0.62, 0.9, 4.0)
  add(g, BOX, M.steel, 0.5, 0.915, 4.2, 0.66, 0.03, 4.05)
  add(g, BOX, M.white, 0.55, 0.95, 6.9, 0.72, 1.9, 0.72)
  // 廁所
  wall(g, 9.2, 0.1, 9.2, 6.8)
  wall(g, 3.4, 6.8, 9.2, 6.8, [[0.8, 1.7], [3.9, 4.8]])
  wall(g, 6.3, 0.1, 6.3, 6.8)
  for (const x0 of [3.4, 6.3]) {
    for (let i = 1; i < 3; i++) add(g, BOX, M.wall, x0 + i * 0.97, 1.0, 0.9, 0.05, 2.0, 1.6)
    add(g, BOX, M.wall, x0 + 1.45, 1.0, 1.72, 2.9, 2.0, 0.05)
    add(g, BOX, M.white, x0 + 2.65, 0.43, 4.3, 0.5, 0.86, 2.2)
  }
  // 電梯 ×4 與管道間
  for (const [x, door] of [[11.15, 12.93], [16.75, 14.97]]) {
    for (const z of [1.8, 5.15]) {
      add(g, BOX, M.lift, x, WH / 2, z, 3.5, WH, 3.2)
      add(g, BOX, M.steel, door, 1.05, z, 0.05, 2.1, 1.1)
    }
  }
  add(g, BOX, M.wall, 19.2, WH / 2, 3.45, 1.3, WH, 6.6)
  // 直通樓梯 ×2
  const stairs = (x0: number, x1: number, z0: number, z1: number, door: 'n' | 'e') => {
    const nGaps: Gaps = door === 'n' ? [[x1 - x0 - 1.4, x1 - x0 - 0.4]] : []
    const eGaps: Gaps = door === 'e' ? [[0.5, 1.5]] : []
    wall(g, x0, z0, x1, z0, nGaps)
    wall(g, x1, z0, x1, z1, eGaps)
    if (door === 'n') wall(g, x0, z0, x0, z1)
    const flight = (zA: number, zB: number, up: boolean) => {
      for (let i = 0; i < 10; i++) {
        const h = (i + 1) * 0.17, x = up ? x0 + 1.1 + i * 0.28 : x1 - 0.5 - i * 0.28
        add(g, BOX, M.stair, x, h / 2, (zA + zB) / 2, 0.28, h, zB - zA)
      }
    }
    flight(z0 + 0.2, (z0 + z1) / 2 - 0.1, false)
    flight((z0 + z1) / 2 + 0.1, z1 - 0.2, true)
    add(g, BOX, M.stair, x0 + 0.55, 0.85, (z0 + z1) / 2, 0.9, 1.7, z1 - z0 - 0.4)
  }
  stairs(0.1, 5.0, 9.6, 13.45, 'e')
  stairs(13.2, 18.4, 9.6, 13.45, 'n')
  add(g, BOX, M.wall, 19.15, WH / 2, 11.5, 1.5, WH, 3.8)
  // 梯廳品牌牆：深木牆面 + 福懋 logo（呼應實景大廳）
  add(g, BOX, M.oakDark, 13.07, 1.2, 11.5, 0.06, 2.3, 2.9)
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.35, (1.35 * 336) / 512), M.logo)
  logo.rotation.y = -Math.PI / 2
  logo.position.set(13.03, 1.45, 11.5)
  logo.userData.keep = true
  g.add(logo)
  // 結構柱
  for (const [x, z] of [[0.45, 30.75], [10.5, 30.75], [19.55, 30.75], [0.45, 22.3], [19.55, 22.3], [0.45, 0.45], [19.55, 0.45]]) {
    add(g, BOX, M.wall, x, WH / 2, z, 0.8, WH, 0.8)
  }
  const coreLabel = (x: number, z: number, text: string, y = 0.15) =>
    labels.push({ p: new THREE.Vector3(x, y, z), html: text, cls: 'lb lb-core' })
  coreLabel(8.4, 8.3, type === 'f1' ? '大廳' : '梯廳')
  coreLabel(13.95, 3.4, '電梯 ×4', WH + 0.1)
  coreLabel(1.7, 2.2, '茶水間')
  coreLabel(6.3, 4.0, '廁所')
  coreLabel(2.6, 11.5, '安全梯')
  coreLabel(15.8, 11.5, '安全梯')

  // 兩戶
  for (const side of ['L', 'R'] as Side[]) {
    const u = unitOf(side), r = unitRect(side), d = UNIT[side].d
    if (u.occ) {
      const box = add(g, BOX, M.occ, r.cx, WH / 2 + 0.02, r.cz, r.x1 - r.x0 - 0.1, WH, d - 0.1, 0, false)
      box.userData.keep = true
      box.renderOrder = 2
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), LINE)
      edge.position.copy(box.position)
      edge.scale.copy(box.scale)
      g.add(edge)
    } else {
      const res = LAYOUTS[layout](local(g, side, labels))
      stats.plan[side] = res.text
      if (!stats.zones.length) stats.zones = res.pins
    }
    labels.push({
      p: new THREE.Vector3(r.cx, 0.2, 35.0),
      cls: 'lb lb-unit' + (u.occ ? ' occ' : ''),
      html: `<b>${u.id}</b>${u.area} 坪<em>${u.occ ? 'Occupied' : '招租中'}</em>`,
    })
    // 滑鼠偵測面
    const pick = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, d), M.pick)
    pick.rotation.x = -Math.PI / 2
    pick.position.set(r.cx, 0.05, r.cz)
    pick.userData = { keep: true, side }
    g.add(pick)
    picks.push(pick)
    // hover 金框
    const ring = new THREE.Group()
    ring.visible = false
    ring.userData.keep = true
    const edges: [number, number, number, number][] = [
      [r.cx, r.z0 + 0.05, r.x1 - r.x0, 0.1], [r.cx, r.z1 - 0.05, r.x1 - r.x0, 0.1],
      [r.x0 + 0.05, r.cz, 0.1, d], [r.x1 - 0.05, r.cz, 0.1, d],
    ]
    for (const [rx, rz, sx, sz] of edges) {
      const m = new THREE.Mesh(BOX, M.hi)
      m.scale.set(sx, 0.02, sz)
      m.position.set(rx, 0.04, rz)
      ring.add(m)
    }
    g.add(ring)
    rings[side] = ring
  }

  mergeStatic(g, LINE)
  return { group: g, labels, stats, picks, rings }
}

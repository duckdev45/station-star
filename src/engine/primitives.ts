/* 世界座標的建模工具：牆、玻璃隔間、立面窗、樓板 */
import * as THREE from 'three'
import { K, WH } from './kit'
import type { Side, ZonePin } from '../data/types'

export interface Label {
  p: THREE.Vector3
  html: string
  cls: string
  el?: HTMLDivElement
  /** 半寬（px），用來把戶別標籤夾在畫面內 */
  hw?: number
}

export function add(
  g: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material,
  x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, cast = true,
) {
  const o = new THREE.Mesh(geo, m)
  o.position.set(x, y, z)
  o.scale.set(sx, sy, sz)
  o.rotation.y = ry
  o.castShadow = cast
  o.receiveShadow = true
  g.add(o)
  return o
}

type SegFn = (cx: number, cz: number, len: number, ry: number) => void
function seg(x1: number, z1: number, x2: number, z2: number, fn: SegFn) {
  const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz)
  if (L < 0.02) return
  fn((x1 + x2) / 2, (z1 + z2) / 2, L, -Math.atan2(dz, dx))
}

/** gaps：自起點量起的 [開始, 結束] 距離（門洞） */
export type Gaps = [number, number][]
function splitGaps(
  x1: number, z1: number, x2: number, z2: number, gaps: Gaps,
  cb: (a: number, b: number, c: number, d: number, isGap: boolean) => void,
) {
  const L = Math.hypot(x2 - x1, z2 - z1), ux = (x2 - x1) / L, uz = (z2 - z1) / L
  let a = 0
  ;[...gaps].sort((p, q) => p[0] - q[0]).concat([[L, L]]).forEach(([s, e]) => {
    if (s - a > 0.02) cb(x1 + ux * a, z1 + uz * a, x1 + ux * s, z1 + uz * s, false)
    if (e > s && e < L) cb(x1 + ux * s, z1 + uz * s, x1 + ux * e, z1 + uz * e, true)
    a = e
  })
}

export function wall(g: THREE.Object3D, x1: number, z1: number, x2: number, z2: number, gaps: Gaps = [], t = 0.16) {
  const { M, BOX } = K()
  splitGaps(x1, z1, x2, z2, gaps, (a, b, c, d, isGap) => seg(a, b, c, d, (cx, cz, L, ry) => {
    if (isGap) add(g, BOX, M.wall, cx, 2.15 + (WH - 2.15) / 2, cz, L, WH - 2.15, t, ry)
    else add(g, BOX, M.wall, cx, WH / 2, cz, L, WH, t, ry)
  }))
}

export function glass(g: THREE.Object3D, x1: number, z1: number, x2: number, z2: number, gaps: Gaps = []) {
  const { M, BOX } = K()
  splitGaps(x1, z1, x2, z2, gaps, (a, b, c, d, isGap) => seg(a, b, c, d, (cx, cz, L, ry) => {
    if (isGap) { add(g, BOX, M.frame, cx, WH - 0.05, cz, L, 0.1, 0.07, ry); return }
    add(g, BOX, M.frame, cx, 0.04, cz, L, 0.08, 0.07, ry)
    add(g, BOX, M.frame, cx, WH - 0.03, cz, L, 0.06, 0.07, ry)
    add(g, BOX, M.glass, cx, WH / 2, cz, L, WH - 0.12, 0.02, ry, false)
    const n = Math.max(1, Math.round(L / 1.7)), ux = Math.cos(-ry), uz = Math.sin(-ry)
    for (let i = 0; i <= n; i++) {
      const s = -L / 2 + (L * i) / n
      add(g, BOX, M.frame, cx + ux * s, WH / 2, cz + uz * s, 0.045, WH, 0.05, ry)
    }
  }))
}

/** 外牆窗：sill = 窗台高（1F 店面為 0，整面落地） */
export function facade(g: THREE.Object3D, x1: number, z1: number, x2: number, z2: number, sill = 0.9) {
  const { M, BOX } = K()
  seg(x1, z1, x2, z2, (cx, cz, L, ry) => {
    const ux = Math.cos(-ry), uz = Math.sin(-ry)
    if (sill > 0) add(g, BOX, M.wall, cx, sill / 2, cz, L, sill, 0.22, ry)
    add(g, BOX, M.glass, cx, (sill + WH) / 2, cz, L, WH - sill, 0.02, ry, false)
    add(g, BOX, M.frame, cx, WH - 0.04, cz, L, 0.08, 0.09, ry)
    if (sill === 0) add(g, BOX, M.frame, cx, 0.04, cz, L, 0.08, 0.09, ry)
    const n = Math.max(1, Math.round(L / 1.6))
    for (let i = 0; i <= n; i++) {
      const s = -L / 2 + (L * i) / n
      add(g, BOX, M.frame, cx + ux * s, (sill + WH) / 2, cz + uz * s, 0.05, WH - sill, 0.09, ry)
    }
  })
}

/** 圓角矩形（XZ 平面，shape 以 (x, -z) 表示） */
export function roundRect(x0: number, z0: number, x1: number, z1: number, rFront: number, rBack: number) {
  const s = new THREE.Shape()
  s.moveTo(x0 + rBack, -z0); s.lineTo(x1 - rBack, -z0); s.quadraticCurveTo(x1, -z0, x1, -z0 - rBack)
  s.lineTo(x1, -z1 + rFront); s.quadraticCurveTo(x1, -z1, x1 - rFront, -z1)
  s.lineTo(x0 + rFront, -z1); s.quadraticCurveTo(x0, -z1, x0, -z1 + rFront)
  s.lineTo(x0, -z0 - rBack); s.quadraticCurveTo(x0, -z0, x0 + rBack, -z0)
  return s
}

export function extrude(g: THREE.Object3D, shape: THREE.Shape, depth: number, y: number, m: THREE.Material) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 })
  geo.rotateX(-Math.PI / 2)
  const o = new THREE.Mesh(geo, m)
  o.position.y = y
  o.castShadow = o.receiveShadow = true
  g.add(o)
  return o
}

/** 有貼圖的地坪：UV 依實際尺寸縮放，rep = 一張貼圖代表幾公尺 */
export function floorPlane(g: THREE.Object3D, x0: number, z0: number, x1: number, z1: number, m: THREE.Material, rep = 2.4, y = 0.012) {
  const w = x1 - x0, d = z1 - z0, geo = new THREE.PlaneGeometry(w, d), uv = geo.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / rep, (uv.getY(i) * d) / rep)
  const o = new THREE.Mesh(geo, m)
  o.rotation.x = -Math.PI / 2
  o.position.set((x0 + x1) / 2, y, (z0 + z1) / 2)
  o.receiveShadow = true
  o.userData.keep = true
  g.add(o)
  return o
}

/* ---------- 戶內座標系 ----------
   u：從分戶牆往外牆方向；v：從梯廳側往建國三路側。
   S1 在左側所以 u 往 -x，同一套配置函式可以鏡射到兩戶。 */
export const UNIT: Record<Side, { x0: number; dir: 1 | -1; w: number; z0: number; d: number }> = {
  L: { x0: 10.4, dir: -1, w: 10.25, z0: 13.55, d: 17.5 },
  R: { x0: 10.6, dir: 1, w: 9.25, z0: 13.55, d: 17.5 },
}

export function unitRect(side: Side) {
  const s = UNIT[side]
  const x0 = Math.min(s.x0, s.x0 + s.dir * s.w), x1 = Math.max(s.x0, s.x0 + s.dir * s.w)
  return { x0, x1, z0: s.z0, z1: s.z0 + s.d, cx: (x0 + x1) / 2, cz: s.z0 + s.d / 2 }
}

export interface Local {
  w: number
  d: number
  pins: ZonePin[]
  box(u: number, v: number, y: number, su: number, sv: number, sy: number, m: THREE.Material, cast?: boolean): THREE.Mesh
  cyl(u: number, v: number, y: number, r: number, h: number, m: THREE.Material): THREE.Mesh
  sph(u: number, v: number, y: number, r: number, m: THREE.Material): THREE.Mesh
  ico(u: number, v: number, y: number, r: number, m: THREE.Material): THREE.Mesh
  wallU(u1: number, u2: number, v: number, gaps?: Gaps, t?: number): void
  glassU(u1: number, u2: number, v: number, gaps?: Gaps): void
  glassV(v1: number, v2: number, u: number, gaps?: Gaps): void
  /** 局部地坪（例如陶磚） */
  patch(u0: number, u1: number, v0: number, v1: number, m: THREE.Material): void
  /** 插畫壁紙牆 */
  paper(u0: number, u1: number, v: number, h: number): void
  /** 編號圖釘：同名空間共用同一個號碼 */
  pin(u: number, v: number, name: string, sub?: string): void
}

export function local(g: THREE.Object3D, side: Side, labels: Label[]): Local {
  const { M, BOX, CYL, SPH, ICO } = K()
  const s = UNIT[side]
  const wx = (u: number) => s.x0 + s.dir * u
  const wz = (v: number) => s.z0 + v
  const L: Local = {
    w: s.w, d: s.d, pins: [],
    box: (u, v, y, su, sv, sy, m, cast = true) => add(g, BOX, m, wx(u), y + sy / 2, wz(v), su, sy, sv, 0, cast),
    cyl: (u, v, y, r, h, m) => add(g, CYL, m, wx(u), y + h / 2, wz(v), r, h, r),
    sph: (u, v, y, r, m) => add(g, SPH, m, wx(u), y, wz(v), r, r, r),
    ico: (u, v, y, r, m) => add(g, ICO, m, wx(u), y, wz(v), r, r * 0.9, r),
    wallU: (u1, u2, v, gaps, t) => wall(g, wx(u1), wz(v), wx(u2), wz(v), gaps, t),
    glassU: (u1, u2, v, gaps) => glass(g, wx(u1), wz(v), wx(u2), wz(v), gaps),
    glassV: (v1, v2, u, gaps) => glass(g, wx(u), wz(v1), wx(u), wz(v2), gaps),
    patch: (u0, u1, v0, v1, m) => {
      floorPlane(g, Math.min(wx(u0), wx(u1)), wz(v0), Math.max(wx(u0), wx(u1)), wz(v1), m, 1.2, 0.02)
    },
    paper: (u0, u1, v, h) => {
      const su = Math.abs(u1 - u0), geo = new THREE.BoxGeometry(su, h, 0.05), uv = geo.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * su) / 1.4, (uv.getY(i) * h) / 1.4)
      const o = new THREE.Mesh(geo, M.paper)
      o.position.set(wx((u0 + u1) / 2), h / 2, wz(v))
      o.receiveShadow = true
      o.userData.keep = true
      g.add(o)
    },
    pin: (u, v, name, sub) => {
      let i = L.pins.findIndex((p) => p.name === name)
      if (i < 0) { L.pins.push({ name, sub }); i = L.pins.length - 1 }
      labels.push({ p: new THREE.Vector3(wx(u), 0.3, wz(v)), html: String(i + 1), cls: 'lb lb-pin' })
    },
  }
  return L
}

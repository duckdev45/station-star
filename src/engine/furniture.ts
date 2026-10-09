/* 家具與人物：全部用方塊／圓柱組成，配合描邊呈現等角插畫感 */
import type * as THREE from 'three'
import { K, rnd } from './kit'
import type { Local } from './primitives'

const M = () => K().M

export function plant(L: Local, u: number, v: number, s = 1) {
  L.cyl(u, v, 0, 0.22 * s, 0.48 * s, M().pot)
  L.ico(u, v, 0.9 * s, 0.46 * s, M().leaf)
  L.ico(u + 0.12 * s, v - 0.1 * s, 1.26 * s, 0.3 * s, M().leaf2)
}
/** face：+1 面向 +v，-1 面向 -v */
export function chair(L: Local, u: number, v: number, face: number, m: THREE.Material = M().blue) {
  L.box(u, v, 0, 0.42, 0.42, 0.45, m)
  L.box(u, v - face * 0.2, 0.45, 0.42, 0.05, 0.4, m)
}
export function person(L: Local, u: number, v: number) {
  L.box(u - 0.07, v, 0, 0.12, 0.16, 0.82, M().person)
  L.box(u + 0.07, v, 0, 0.12, 0.16, 0.82, M().person)
  L.cyl(u, v, 0.8, 0.19, 0.62, M().person)
  L.sph(u, v, 1.58, 0.12, M().person)
}
export function sitter(L: Local, u: number, v: number) {
  L.cyl(u, v, 0.45, 0.18, 0.55, M().person)
  L.sph(u, v, 1.13, 0.12, M().person)
}
export function lamp(L: Local, u: number, v: number) {
  L.sph(u, v, 2.0, 0.26, M().lamp)
  L.cyl(u, v, 2.26, 0.008, 0.14, M().frame)
}
export function rug(L: Local, u: number, v: number, su: number, sv: number) {
  L.box(u, v, 0.012, su, sv, 0.012, M().rug, false)
}
export function sofa(L: Local, u: number, v: number, len = 1.9) {
  const m = M().cream
  L.box(u, v, 0, 0.82, len, 0.42, m)
  L.box(u + 0.34, v, 0.42, 0.14, len, 0.4, m)
  L.box(u, v - len / 2 + 0.06, 0.42, 0.82, 0.12, 0.2, m)
  L.box(u, v + len / 2 - 0.06, 0.42, 0.82, 0.12, 0.2, m)
}
export function armchair(L: Local, u: number, v: number, m: THREE.Material = M().blue) {
  L.box(u, v, 0, 0.7, 0.7, 0.4, m)
  L.box(u, v + 0.3, 0.4, 0.7, 0.1, 0.42, m)
  L.box(u - 0.3, v, 0.4, 0.1, 0.7, 0.18, m)
  L.box(u + 0.3, v, 0.4, 0.1, 0.7, 0.18, m)
}
export function roundTable(L: Local, u: number, v: number, r = 0.45) {
  L.cyl(u, v, 0, 0.05, 0.72, M().black)
  L.cyl(u, v, 0.72, r, 0.04, M().oak)
}
/** 書櫃：依 su / sv 較長的方向延伸，書本顏色隨機 */
export function shelf(L: Local, u: number, v: number, su: number, sv: number, h = 2.1) {
  const along = su > sv, len = along ? su : sv, dep = along ? sv : su
  L.box(u, v, 0, su, sv, h, M().oak)
  for (let y = 0.35; y < h - 0.1; y += 0.42) {
    let p = -len / 2 + 0.06
    while (p < len / 2 - 0.12) {
      const bw = 0.04 + rnd() * 0.05, bh = 0.22 + rnd() * 0.12
      const m = M().books[Math.floor(rnd() * M().books.length)]
      if (along) L.box(u + p + bw / 2, v, y, bw, dep + 0.02, bh, m, false)
      else L.box(u, v + p + bw / 2, y, dep + 0.02, bw, bh, m, false)
      p += bw + (rnd() < 0.12 ? 0.12 : 0.004)
    }
  }
}
/** 雙人課桌（學生面向 -v） */
export function desk2(L: Local, u: number, v: number) {
  L.box(u, v, 0.7, 1.2, 0.5, 0.04, M().oak)
  L.box(u, v - 0.22, 0.02, 1.12, 0.04, 0.68, M().black)
  L.box(u - 0.57, v, 0, 0.04, 0.46, 0.7, M().black)
  L.box(u + 0.57, v, 0, 0.04, 0.46, 0.7, M().black)
  chair(L, u - 0.3, v + 0.52, -1)
  chair(L, u + 0.3, v + 0.52, -1)
}
/** 自習座位（face = 面向的方向） */
export function carrel(L: Local, u: number, v: number, face: number) {
  L.box(u, v, 0.72, 0.86, 0.58, 0.03, M().oak)
  L.box(u - 0.43, v, 0, 0.03, 0.6, 1.2, M().white)
  L.box(u + 0.43, v, 0, 0.03, 0.6, 1.2, M().white)
  L.box(u, v + face * 0.29, 0.3, 0.86, 0.03, 0.9, M().white)
  chair(L, u, v - face * 0.58, face, M().navy)
}
/** 四人辦公島 */
export function pod(L: Local, u: number, v: number) {
  for (const [du, dv] of [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]]) {
    L.box(u + du, v + dv, 0.72, 1.38, 0.68, 0.03, M().white)
    chair(L, u + du, v + dv + Math.sign(dv) * 0.62, -Math.sign(dv), M().black)
  }
  L.box(u, v, 0.74, 2.8, 0.03, 0.36, M().oak)
  L.box(u, v, 0, 2.7, 0.6, 0.72, M().black)
  return 4
}

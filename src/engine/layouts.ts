/* 各種空間規劃。座標為戶內 (u, v)，單位公尺；寬 L.w、深 L.d。 */
import type { LayoutId, ZonePin } from '../data/types'
import { armchair, carrel, chair, desk2, lamp, person, plant, pod, roundTable, rug, shelf, sitter, sofa } from './furniture'
import { K } from './kit'
import type { Local } from './primitives'

export interface LayoutResult {
  text: string
  pins: ZonePin[]
}

/** 沿分戶牆的走道寬 */
const CW = 1.5
const M = () => K().M

function reception(L: Local, name = '櫃台接待') {
  const w = L.w, cx = (CW + w) / 2
  L.paper(CW + 0.3, w - 0.15, 0.14, 2.35)
  L.box(cx, 0.2, 1.45, 1.0, 0.03, 0.3, M().gold)
  L.box(cx, 1.8, 0, 2.6, 0.62, 1.0, M().white)
  L.box(cx, 1.8, 1.0, 2.72, 0.74, 0.04, M().oak)
  person(L, cx - 0.4, 1.05)
  sofa(L, w - 0.55, 2.75, 1.8)
  plant(L, w - 0.55, 0.7, 0.9)
  lamp(L, cx, 1.8)
  L.pin(cx, 3.2, name)
}

function classroom(L: Local, u0: number, u1: number, v0: number, v1: number, name: string) {
  const cx = (u0 + u1) / 2, W = u1 - u0, wb = Math.min(3.8, W - 1.4)
  L.box(cx, v0 + 0.16, 0.85, wb, 0.04, 1.15, M().white)
  L.box(cx, v0 + 0.2, 0.8, wb + 0.1, 0.07, 0.04, M().black)
  L.box(cx, v0 + 1.05, 0, 1.3, 0.6, 0.76, M().oak)
  person(L, cx - 1.0, v0 + 0.9)
  const gap = 0.42, n = Math.max(1, Math.floor((W - 0.7 + gap) / (1.2 + gap))), span = n * 1.2 + (n - 1) * gap
  let seats = 0, k = 0
  for (let r = 2.3; r + 0.85 <= v1 - v0; r += 1.2) {
    for (let i = 0; i < n; i++) {
      const u = cx - span / 2 + 0.6 + i * (1.2 + gap)
      desk2(L, u, v0 + r)
      seats += 2
      if (k++ % 3 === 1) sitter(L, u - 0.3, v0 + r + 0.52)
    }
  }
  L.pin(cx, (v0 + v1) / 2 + 0.3, name)
  return seats
}

function layoutStudy(L: Local): LayoutResult {
  const w = L.w, d = L.d, cx = (CW + w) / 2
  reception(L, '櫃台・置物櫃')
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) L.box(CW + 0.3 + i * 0.44, 3.95, 0.1 + j * 0.46, 0.42, 0.3, 0.44, M().white)
  L.wallU(CW, w, 4.3)
  L.glassV(4.3, d, CW, [[0.5, 1.4], [8.3, 9.2], [11.0, 12.0]])
  const per = Math.floor((w - CW - 0.5) / 0.95)
  let seats = 0, k = 0
  for (const v of [5.6, 8.0, 10.4]) {
    L.box(cx, v, 0, per * 0.95, 0.04, 1.2, M().white)
    for (let i = 0; i < per; i++) {
      const u = CW + 0.45 + 0.475 + i * 0.95
      carrel(L, u, v - 0.32, 1)
      carrel(L, u, v + 0.32, -1)
      seats += 2
      if (k++ % 4 === 2) sitter(L, u, v + 0.9)
    }
    lamp(L, cx, v)
  }
  L.pin(cx, 6.8, '開放自習區')
  const mid = CW + (w - CW) / 2
  L.glassU(CW, w, 12.1)
  L.glassU(CW, w, 14.6, [[0.4, 1.3], [mid - CW + 0.4, mid - CW + 1.3]])
  L.glassV(12.1, 14.6, mid)
  for (const u of [(CW + mid) / 2, (mid + w) / 2]) {
    roundTable(L, u, 13.35, 0.5)
    chair(L, u - 0.7, 13.35, 1, M().navy); chair(L, u + 0.7, 13.35, 1, M().navy)
    chair(L, u, 12.7, 1, M().navy); chair(L, u, 14.0, -1, M().navy)
  }
  L.pin(cx, 13.35, '討論室 ×2', '各 4 人')
  rug(L, cx + 0.6, 16.0, 4.2, 2.4)
  sofa(L, w - 0.7, 16.0, 2.2)
  armchair(L, CW + 1.2, 16.3)
  roundTable(L, cx, 16.0, 0.4)
  shelf(L, cx - 0.2, 14.85, 3.6, 0.35, 1.6)
  person(L, CW + 2.4, 16.6)
  lamp(L, cx, 16.0)
  plant(L, 0.75, d - 0.7)
  L.pin(cx + 0.6, 16.6, '閱讀角')
  return { text: `開放自習區約 ${seats} 席，另有討論室 2 間與閱讀角`, pins: L.pins }
}

function layoutClass(L: Local): LayoutResult {
  const w = L.w, d = L.d
  reception(L)
  L.wallU(CW, w, 4.3)
  L.glassV(4.3, d, CW, [[0.6, 1.5], [7.1, 8.0]])
  L.wallU(CW, w, 10.95)
  const s = classroom(L, CW, w, 4.3, 10.95, '教室 A') + classroom(L, CW, w, 10.95, d, '教室 B')
  plant(L, 0.75, d - 0.7)
  person(L, 0.75, 8.2)
  return { text: `教室 2 間，可做語言、技能或才藝課程，約 ${s} 席`, pins: L.pins }
}

function layoutStudio(L: Local): LayoutResult {
  const w = L.w, d = L.d, cx = (CW + w) / 2
  reception(L)
  L.wallU(CW, w, 4.3)
  L.glassV(4.3, d, CW, [[1.6, 2.5], [7.0, 7.9], [11.0, 11.9]])
  L.wallU(CW, w, 9.7)
  // 攝影棚：背景布、主持桌、柔光燈、攝影機
  L.box(w - 0.2, 7.0, 0, 0.06, 4.2, 2.3, M().screen)
  L.box(w - 1.0, 7.0, 0, 1.6, 4.2, 0.02, M().screen, false)
  L.box(w - 2.2, 7.0, 0, 0.7, 1.7, 0.74, M().oak)
  L.cyl(w - 1.55, 6.55, 0, 0.2, 0.45, M().black); L.cyl(w - 1.55, 7.45, 0, 0.2, 0.45, M().black)
  sitter(L, w - 1.55, 6.55); sitter(L, w - 1.55, 7.45)
  for (const v of [5.3, 8.7]) { L.cyl(CW + 2.4, v, 0, 0.02, 1.7, M().black); L.box(CW + 2.4, v, 1.6, 0.55, 0.5, 0.45, M().white) }
  L.cyl(CW + 1.6, 7.0, 0, 0.025, 1.35, M().black); L.box(CW + 1.6, 7.0, 1.35, 0.25, 0.18, 0.16, M().black)
  person(L, CW + 1.2, 6.3)
  L.pin(cx - 0.6, 7.0, '攝影棚')
  // 共創工作坊
  let seats = 0
  const tw = Math.min(4.2, w - CW - 1.4), n = Math.floor(tw / 0.8)
  for (const v of [11.2, 13.4]) {
    L.box(cx, v, 0.74, tw, 1.1, 0.05, M().oak); L.box(cx, v, 0, tw - 0.4, 0.5, 0.74, M().black)
    for (let i = 0; i < n; i++) {
      const u = cx - (n - 1) * 0.4 + i * 0.8
      L.cyl(u, v - 0.85, 0, 0.17, 0.62, M().oak); L.cyl(u, v + 0.85, 0, 0.17, 0.62, M().oak)
      seats += 2
    }
    lamp(L, cx - 0.9, v); lamp(L, cx + 0.9, v)
    sitter(L, cx - 0.4, v + 0.85); sitter(L, cx + 1.2, v - 0.85)
  }
  L.pin(cx, 12.3, '共創工作坊')
  // 交流吧台（陶磚地坪）
  L.patch(CW, w, 14.6, d, M().terra)
  L.box(cx + 0.3, d - 0.5, 0, w - CW - 1.6, 0.5, 1.05, M().white)
  L.box(cx + 0.3, d - 0.5, 1.05, w - CW - 1.5, 0.6, 0.04, M().navy)
  for (let u = CW + 1.4; u < w - 1.2; u += 0.9) L.cyl(u, d - 1.1, 0, 0.17, 0.75, M().black)
  armchair(L, CW + 1.0, 15.6, M().terraMat)
  roundTable(L, CW + 2.0, 15.4, 0.35)
  person(L, cx + 1.5, 15.6)
  plant(L, w - 0.6, 15.0)
  L.pin(cx, 15.6, '交流吧台')
  return { text: `攝影棚、共創工作坊（約 ${seats} 席）與交流吧台，適合線上課程與工作室`, pins: L.pins }
}

function layoutOffice(L: Local): LayoutResult {
  const w = L.w, d = L.d, cx = (CW + w) / 2
  reception(L)
  L.glassU(CW, w, 4.3, [[0.2, 1.1]])
  L.glassU(CW, w, 8.6)
  L.glassV(4.3, 8.6, CW, [[1.6, 2.5]])
  const tl = Math.min(3.6, w - CW - 2.4), nm = Math.floor(tl / 0.75)
  L.box(cx, 6.5, 0.72, tl, 1.2, 0.05, M().oakDark); L.box(cx, 6.5, 0, tl - 0.6, 0.4, 0.72, M().black)
  let mt = 0
  for (let i = 0; i < nm; i++) {
    const u = cx - (nm - 1) * 0.375 + i * 0.75
    chair(L, u, 5.55, 1, M().black); chair(L, u, 7.45, -1, M().black)
    mt += 2
  }
  sitter(L, cx - 0.375, 5.55); sitter(L, cx + 0.375, 7.45)
  lamp(L, cx - 0.8, 6.5); lamp(L, cx + 0.8, 6.5)
  L.box(w - 0.12, 6.45, 0.9, 0.04, 2.6, 1.3, M().screen)
  L.pin(cx, 6.5, '會議室', `${mt} 人`)
  // 主管室
  const mx0 = w - 3.7, mv0 = d - 3.4
  L.glassU(mx0, w, mv0, [[0.4, 1.3]])
  L.glassV(mv0, d, mx0)
  L.box(mx0 + 1.9, d - 1.9, 0, 1.8, 0.8, 0.75, M().oakDark)
  chair(L, mx0 + 1.9, d - 1.2, -1, M().black)
  shelf(L, w - 0.3, d - 1.9, 0.4, 2.2, 1.9)
  plant(L, mx0 + 0.5, d - 0.6, 0.9)
  L.pin(mx0 + 1.85, d - 2.7, '主管室')
  // 開放辦公區
  let seats = 0, k = 0
  for (const v of [10.4, 12.9]) {
    for (let u = CW + 2.0; u + 1.45 <= w - 0.3; u += 3.5) {
      seats += pod(L, u, v)
      if (k++ % 2 === 0) sitter(L, u - 0.7, v - 0.97)
    }
  }
  for (let u = CW + 2.0; u + 1.45 <= mx0 - 0.3; u += 3.5) seats += pod(L, u, 15.8)
  person(L, 0.75, 11.5)
  L.pin(cx, 11.65, '開放辦公區')
  plant(L, 0.75, d - 0.7)
  return { text: `會議室、開放辦公區（約 ${seats} 個座位）與主管室`, pins: L.pins }
}

function layoutHall(L: Local): LayoutResult {
  const w = L.w, d = L.d
  reception(L, '報到櫃台')
  L.glassU(CW, w, 4.3, [[0.3, 1.6]])
  L.box(w / 2, d - 1.25, 0, w - 1.2, 2.1, 0.32, M().oakDark)
  L.box(w / 2, d - 0.35, 0.9, Math.min(5.2, w - 3), 0.06, 1.7, M().screen)
  L.box(w / 2 + 1.6, d - 1.4, 0.32, 0.6, 0.45, 1.05, M().oak)
  person(L, w / 2 + 1.0, d - 1.2)
  let seats = 0, k = 0
  for (let v = 5.5; v <= d - 3.1; v += 0.95) {
    for (let u = 0.75; u <= w - 0.55; u += 0.62) {
      if (Math.abs(u - w / 2) < 0.45) continue
      L.box(u, v, 0, 0.48, 0.46, 0.45, M().navy)
      L.box(u, v - 0.22, 0.45, 0.48, 0.05, 0.42, M().navy)
      L.box(u + 0.2, v + 0.1, 0.62, 0.14, 0.32, 0.03, M().oak)
      seats++
      if (k++ % 5 === 2) sitter(L, u, v)
    }
  }
  L.pin(w / 2, 9.8, '講堂')
  L.pin(w / 2, d - 1.25, '舞台')
  return { text: `講堂約 ${seats} 席，可與相鄰戶打通合併`, pins: L.pins }
}

function layoutCafe(L: Local): LayoutResult {
  const w = L.w, d = L.d, cx = w / 2
  L.paper(1.0, w - 0.2, 0.14, 2.35)
  L.box(cx + 0.4, 0.5, 0, w - 2.2, 0.55, 0.92, M().white)
  L.box(cx + 0.4, 0.5, 0.92, w - 2.1, 0.6, 0.04, M().steel)
  L.box(cx - 0.6, 0.5, 0.96, 0.5, 0.4, 0.45, M().steel)
  L.box(cx + 0.2, 0.5, 0.96, 0.4, 0.35, 0.3, M().black)
  L.box(cx + 0.4, 2.3, 0, w - 2.8, 0.7, 1.05, M().oak)
  L.box(cx + 0.4, 2.3, 1.05, w - 2.7, 0.78, 0.04, M().navy)
  person(L, cx, 1.4)
  for (const u of [cx - 1.2, cx + 0.4, cx + 2.0]) lamp(L, u, 2.3)
  L.pin(cx + 0.4, 3.3, '咖啡吧台')
  shelf(L, 0.35, d / 2 + 1, 0.5, d - 6.5, 2.2)
  L.pin(1.3, d / 2 + 1, '書牆')
  L.patch(1.0, w, 4.0, d, M().terra)
  let seats = 0, k = 0
  for (const v of [5.4, 8.0, 10.6, 13.2]) {
    for (const u of [w * 0.36, w * 0.7]) {
      roundTable(L, u, v, 0.45)
      chair(L, u, v - 0.72, 1, M().black); chair(L, u, v + 0.72, -1, M().black)
      seats += 2
      if (k++ % 3 === 0) sitter(L, u, v - 0.72)
    }
  }
  armchair(L, w * 0.36, d - 1.3, M().blue)
  armchair(L, w * 0.7, d - 1.3, M().terraMat)
  roundTable(L, w * 0.53, d - 1.4, 0.35)
  plant(L, 0.9, d - 0.8); plant(L, w - 0.7, d - 0.8)
  person(L, w * 0.53, 6.7)
  L.pin(w * 0.53, 9.3, '座位區')
  return { text: `書店咖啡配置，約 ${seats} 席，書牆與咖啡吧台`, pins: L.pins }
}

export const LAYOUTS: Record<LayoutId, (L: Local) => LayoutResult> = {
  study: layoutStudy,
  class: layoutClass,
  studio: layoutStudio,
  office: layoutOffice,
  hall: layoutHall,
  cafe: layoutCafe,
}

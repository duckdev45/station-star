/* =========================================================
   建案資料：日常更新只要改這個檔案
   ========================================================= */
import type { FloorType, PresetId, UnitDef, Zone } from './types'

export const PROJECT = {
  name: '福懋站前之星',
  developer: '福懋建設',
  slogan: ['築夢，從這裡開始', '學習，永不止步'],
  footnote: '凌空 27 層，高雄車站步行 4 分鐘',
  location: '建國三路近中山一路，面高雄中學，步行 4 分鐘到高雄車站',
  contact: { label: '07-336-5051 分機 137', tel: 'tel:+88673365051,137', person: '洪先生' },
  disclaimer: '樓層主題與空間配置為規劃示意；實際用途依建物使用執照與相關法規為準，坪數與出租狀態以合約為準。',
  totalFloors: 27,
}

/** 樓層主題（由上而下）。def = 切到該分區時預設帶入的規劃 */
export const ZONES: Zone[] = [
  { id: 'build', name: '築夢層', range: [20, 27], def: 'office', desc: '高樓層視野，適合企業總部與品牌辦公' },
  { id: 'create', name: '創作層', range: [11, 19], def: 'studio', desc: '工作室、攝影棚與培訓教室，把想法做出來' },
  { id: 'learn', name: '學習層', range: [3, 10], def: 'study', desc: '自習中心與課程教室，車站與雄中旁的學習據點' },
  { id: 'cohort', name: '共學講堂', range: [2, 2], def: 'hall', desc: '講座、讀書會與成果發表的共學場域' },
  { id: 'street', name: '街角店面', range: [1, 1], def: 'cafe', desc: '書店咖啡與輕食，築夢基地的第一站' },
]

export const FLOOR_TYPES: Record<FloorType, { desc: string; units: UnitDef[] }> = {
  std: {
    desc: '一層兩戶、四部電梯、兩座直通樓梯',
    units: [
      { id: 'S1', side: 'L', area: 99, note: '轉角邊間，臨河北二路 91 巷與建國三路，雙面採光' },
      { id: 'S2', side: 'R', area: 94, note: '面建國三路，格局方正，屋深約 17 米' },
    ],
  },
  f2: {
    desc: '兩戶可合併承租',
    units: [
      { id: '2F-A', side: 'L', area: 102, note: '轉角邊間，可與 2F-B 打通' },
      { id: '2F-B', side: 'R', area: 97, note: '面建國三路，可與 2F-A 打通' },
    ],
  },
  f1: {
    desc: '建國三路臨路店面',
    units: [
      { id: '店面 A', side: 'L', area: 70, note: '轉角店面，兩面臨路展示' },
      { id: '店面 B', side: 'R', area: 62, note: '建國三路正面店面' },
    ],
  },
}

/** 已出租的戶：「樓層-戶別」 */
export const LEASED = new Set<string>([
  '1-店面 A', '3-S1', '3-S2', '4-S1', '4-S2', '5-S1', '5-S2', '7-S2', '8-S1', '8-S2', '10-S1',
  '11-S1', '11-S2', '12-S1', '12-S2', '14-S2', '16-S1', '16-S2', '17-S1', '17-S2', '20-S1',
  '21-S1', '21-S2', '23-S2', '26-S1', '26-S2', '27-S1', '27-S2',
])

/** 標準層可切換的規劃方案 */
export const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'study', label: '自習中心' },
  { id: 'class', label: '課程教室' },
  { id: 'studio', label: '創作工作室' },
  { id: 'office', label: '企業總部' },
]

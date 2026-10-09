/* 插畫壁紙：學習與高雄的小圖案，散落排列（參考提供的插畫壁紙）。可無縫重複。 */
type Ctx = CanvasRenderingContext2D

const C = { navy: '#2f4468', terra: '#b4573d', mus: '#d6a43c', sage: '#7d9662', brown: '#6d4c35', sky: '#8fb1cf', cream: '#fbf6ea', grey: '#8b8680' }

const ICONS: ((g: Ctx) => void)[] = [
  // 書堆
  (g) => { ([[C.terra, 0], [C.navy, -6], [C.mus, -12]] as const).forEach(([c, y], i) => { g.fillStyle = c; g.fillRect(-12 + i * 2, y, 24 - i * 3, 5) }) },
  // 打開的書
  (g) => {
    g.fillStyle = C.cream; g.strokeStyle = C.navy; g.lineWidth = 1.5; g.beginPath()
    g.moveTo(0, -6); g.quadraticCurveTo(-8, -10, -15, -7); g.lineTo(-15, 7); g.quadraticCurveTo(-8, 4, 0, 8)
    g.quadraticCurveTo(8, 4, 15, 7); g.lineTo(15, -7); g.quadraticCurveTo(8, -10, 0, -6); g.closePath(); g.fill(); g.stroke()
    g.beginPath(); g.moveTo(0, -6); g.lineTo(0, 8); g.stroke()
  },
  // 鉛筆
  (g) => {
    g.rotate(-0.7); g.fillStyle = C.mus; g.fillRect(-14, -3, 22, 6); g.fillStyle = C.terra; g.fillRect(-18, -3, 4, 6)
    g.fillStyle = '#e8cfa8'; g.beginPath(); g.moveTo(8, -3); g.lineTo(15, 0); g.lineTo(8, 3); g.fill()
  },
  // 燈泡
  (g) => { g.fillStyle = '#f2c94c'; g.beginPath(); g.arc(0, -4, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = C.grey; g.fillRect(-4, 4, 8, 6) },
  // 地球儀
  (g) => {
    g.fillStyle = C.sky; g.beginPath(); g.arc(0, -3, 9, 0, Math.PI * 2); g.fill()
    g.strokeStyle = C.navy; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -3, 4, 9, 0, 0, Math.PI * 2); g.moveTo(-9, -3); g.lineTo(9, -3); g.stroke()
    g.fillStyle = C.brown; g.fillRect(-1, 6, 2, 5); g.fillRect(-6, 11, 12, 2)
  },
  // 紙飛機
  (g) => {
    g.fillStyle = C.cream; g.strokeStyle = C.navy; g.lineWidth = 1.3; g.beginPath()
    g.moveTo(-14, 2); g.lineTo(14, -8); g.lineTo(2, 9); g.lineTo(-1, 2); g.closePath(); g.fill(); g.stroke()
  },
  // 星
  (g) => {
    g.fillStyle = C.mus; g.beginPath()
    g.moveTo(0, -11); g.lineTo(2, -2); g.lineTo(11, 0); g.lineTo(2, 2); g.lineTo(0, 11); g.lineTo(-2, 2); g.lineTo(-11, 0); g.lineTo(-2, -2); g.fill()
  },
  // 咖啡
  (g) => {
    g.fillStyle = C.cream; g.strokeStyle = C.brown; g.lineWidth = 1.5; g.fillRect(-8, -4, 14, 13); g.strokeRect(-8, -4, 14, 13)
    g.beginPath(); g.arc(8, 2, 3.5, -1.5, 1.5); g.stroke()
    g.strokeStyle = C.grey; g.beginPath(); g.moveTo(-3, -7); g.quadraticCurveTo(-6, -11, -2, -14); g.stroke()
  },
  // 筆電
  (g) => { g.fillStyle = C.navy; g.fillRect(-11, -9, 22, 14); g.fillStyle = C.sky; g.fillRect(-9, -7, 18, 10); g.fillStyle = C.grey; g.fillRect(-14, 5, 28, 3) },
  // 盆栽
  (g) => {
    g.fillStyle = C.terra; g.beginPath(); g.moveTo(-6, 2); g.lineTo(6, 2); g.lineTo(4, 11); g.lineTo(-4, 11); g.fill()
    g.fillStyle = C.sage
    ;([[-5, -4, 0.6], [5, -5, -0.6], [0, -9, 0]] as const).forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, 3, 7, r, 0, Math.PI * 2); g.fill() })
  },
  // 雄中紅樓
  (g) => {
    g.fillStyle = '#c2462f'; g.fillRect(-14, -6, 28, 15); g.beginPath(); g.moveTo(-16, -6); g.lineTo(0, -14); g.lineTo(16, -6); g.fill()
    g.fillStyle = C.cream
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-9 + i * 6, -1, 2, Math.PI, 0); g.lineTo(-7 + i * 6, 4); g.lineTo(-11 + i * 6, 4); g.fill() }
  },
  // 列車
  (g) => {
    g.fillStyle = C.cream; g.strokeStyle = C.terra; g.lineWidth = 1.5; g.beginPath()
    if (g.roundRect) g.roundRect(-16, -6, 32, 12, 5); else g.rect(-16, -6, 32, 12)
    g.fill(); g.stroke(); g.fillStyle = C.navy
    for (let i = 0; i < 4; i++) g.fillRect(-12 + i * 7, -3, 4, 4)
    g.fillStyle = C.terra; g.fillRect(-16, 3, 32, 2)
  },
  // 學士帽
  (g) => {
    g.fillStyle = C.navy; g.beginPath(); g.moveTo(0, -9); g.lineTo(15, -3); g.lineTo(0, 3); g.lineTo(-15, -3); g.fill(); g.fillRect(-7, 0, 14, 6)
    g.strokeStyle = C.mus; g.lineWidth = 1.5; g.beginPath(); g.moveTo(9, -3); g.lineTo(11, 7); g.stroke()
  },
  // 單車
  (g) => {
    g.strokeStyle = C.brown; g.lineWidth = 1.6; g.beginPath()
    g.arc(-8, 4, 5, 0, Math.PI * 2); g.moveTo(13, 4); g.arc(8, 4, 5, 0, Math.PI * 2)
    g.moveTo(-8, 4); g.lineTo(-2, -4); g.lineTo(6, -4); g.lineTo(8, 4); g.moveTo(-2, -4); g.lineTo(0, 4); g.lineTo(6, -4); g.stroke()
  },
]

export function drawWallpaper(g: Ctx, size: number, rnd: () => number) {
  g.fillStyle = '#efe6d4'
  g.fillRect(0, 0, size, size)
  const n = 5, cell = size / n
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    g.save()
    g.translate(cell * (i + 0.25 + rnd() * 0.5), cell * (j + 0.25 + rnd() * 0.5))
    g.rotate((rnd() - 0.5) * 0.5)
    g.scale(1.25, 1.25)
    ICONS[(i * 3 + j * 7 + Math.floor(rnd() * 3)) % ICONS.length](g)
    g.restore()
  }
}

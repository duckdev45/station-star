/* 共用幾何、材質與亂數。initKit() 只會執行一次。 */
import * as THREE from 'three'
import { drawWallpaper } from './wallpaper'
import markCreamUrl from '../assets/brand/fumao-mark-cream.webp'

/** 牆高（剖切高度，公尺） */
export const WH = 2.4

let s = 7
/** 固定種子的亂數，讓書櫃、壁紙每次長得一樣 */
export const seed = (n: number) => { s = n }
export const rnd = () => {
  s |= 0; s = (s + 0x6d2b79f5) | 0
  let t = Math.imul(s ^ (s >>> 15), 1 | s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const mat = (hex: string, roughness = 0.85, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color: hex, roughness, metalness, ...extra })

const noEdge = <T extends THREE.Material>(m: T) => { m.userData.noEdge = true; return m }

function canvasTex(draw: (g: CanvasRenderingContext2D, size: number) => void, size = 512) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!, size)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function createKit(onTextureLoad: () => void) {
  const wood = canvasTex((g, size) => {
    seed(3)
    const rows = 6, rh = size / rows
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * size * 0.5
      while (x < size) {
        const len = size * (0.45 + rnd() * 0.4)
        g.fillStyle = `hsl(33 ${38 + rnd() * 8}% ${72 + rnd() * 6}%)`
        g.fillRect(x, r * rh, len, rh)
        for (let k = 0; k < 6; k++) {
          g.strokeStyle = `rgba(120,80,45,${0.04 + rnd() * 0.05})`
          g.beginPath()
          const yy = r * rh + rnd() * rh
          g.moveTo(x, yy); g.bezierCurveTo(x + len * 0.3, yy + 3, x + len * 0.6, yy - 3, x + len, yy); g.stroke()
        }
        g.fillStyle = 'rgba(90,60,30,.22)'; g.fillRect(x, r * rh, 1.5, rh)
        x += len
      }
      g.fillStyle = 'rgba(90,60,30,.22)'; g.fillRect(0, r * rh, size, 1.5)
    }
  }, 1024)
  const grid = (bg: string, cell: () => string, gap: number) => canvasTex((g, size) => {
    g.fillStyle = bg; g.fillRect(0, 0, size, size)
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      g.fillStyle = cell(); g.fillRect(i * size / 4 + gap, j * size / 4 + gap, size / 4 - gap * 2, size / 4 - gap * 2)
    }
  })
  seed(5); const tile = grid('#d9d4cb', () => `hsl(36 9% ${82 + rnd() * 4}%)`, 1)
  seed(9); const terra = grid('#e2c9b6', () => `hsl(12 ${44 + rnd() * 8}% ${40 + rnd() * 6}%)`, 2)
  seed(11); const paper = canvasTex((g, size) => drawWallpaper(g, size, rnd))
  const logo = new THREE.TextureLoader().load(markCreamUrl, onTextureLoad)
  logo.colorSpace = THREE.SRGBColorSpace
  logo.anisotropy = 4

  const M = {
    wall: mat('#f6f3ee', 0.95), slab: mat('#e5dbc4', 0.75), frame: mat('#3a3531', 0.5, 0.3),
    wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.7 }),
    tile: new THREE.MeshStandardMaterial({ map: tile, roughness: 0.6 }),
    terra: new THREE.MeshStandardMaterial({ map: terra, roughness: 0.8 }),
    paper: new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9 }),
    greyFloor: mat('#d3cec6', 0.95),
    glass: new THREE.MeshPhysicalMaterial({ color: '#cfdcdc', roughness: 0.05, transparent: true, opacity: 0.24, depthWrite: false, envMapIntensity: 1.2 }),
    oak: mat('#d4b48a', 0.65), oakDark: mat('#9a734f', 0.6), white: mat('#fbfaf6', 0.5), cream: mat('#ece5d7', 0.9),
    navy: mat('#26385e', 0.7), blue: mat('#7b98c4', 0.8), black: mat('#2c2825', 0.6), terraMat: mat('#a9553c', 0.8),
    steel: mat('#b8b4ad', 0.3, 0.7), screen: mat('#2a2622', 0.35, 0.2), gold: mat('#caa04a', 0.3, 0.7), rug: mat('#e3dfd8', 0.98),
    person: noEdge(mat('#3a2b22', 0.8)),
    lamp: noEdge(mat('#fffdf7', 0.4, 0, { emissive: '#fff1d6', emissiveIntensity: 0.35 })),
    leaf: noEdge(mat('#62804a', 0.85, 0, { flatShading: true })),
    leaf2: noEdge(mat('#86a05e', 0.85, 0, { flatShading: true })),
    pot: mat('#e9e3d8', 0.6),
    books: ['#b4573d', '#2f4468', '#d6a43c', '#e9e1cf', '#6f8a5c', '#3a3531'].map((h) => noEdge(mat(h, 0.8))),
    stair: mat('#e6e1d8', 0.9), lift: mat('#a8a299', 0.7),
    occ: new THREE.MeshStandardMaterial({ color: '#f6f4f0', transparent: true, opacity: 0.86, roughness: 0.95, depthWrite: false }),
    logo: new THREE.MeshBasicMaterial({ map: logo, transparent: true, alphaTest: 0.4, toneMapped: false }),
    hi: new THREE.MeshBasicMaterial({ color: '#e2a93c' }),
    pick: new THREE.MeshBasicMaterial({ visible: false }),
  }
  return {
    M,
    BOX: new THREE.BoxGeometry(1, 1, 1),
    CYL: new THREE.CylinderGeometry(1, 1, 1, 18),
    SPH: new THREE.SphereGeometry(1, 18, 12),
    ICO: new THREE.IcosahedronGeometry(1, 1),
    LINE: new THREE.LineBasicMaterial({ color: '#4e433a', transparent: true, opacity: 0.5 }),
  }
}

export type Kit = ReturnType<typeof createKit>
export type Materials = Kit['M']

let kit: Kit | null = null
let textureListeners: (() => void)[] = []
export function initKit(onTextureLoad: () => void): Kit {
  textureListeners.push(onTextureLoad)
  kit ??= createKit(() => textureListeners.forEach((fn) => fn()))
  return kit
}
export function releaseKitListener(fn: () => void) {
  textureListeners = textureListeners.filter((f) => f !== fn)
}
/** 已初始化的 kit（engine 內部使用） */
export const K = () => {
  if (!kit) throw new Error('initKit() first')
  return kit
}

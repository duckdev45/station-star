/* =========================================================
   3D 空間規劃引擎（不依賴 React）
   - 正交相機的等角剖切視角，可旋轉、縮放
   - 每種「樓層型態 × 規劃 × 出租狀態」只建一次，之後快取
   - 標籤（編號圖釘、戶別、核心名稱）是 DOM，每次渲染時投影定位
   ========================================================= */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { FloorStats, FloorType, LayoutId, Side, Unit } from '../data/types'
import { buildFloor, type BuiltFloor } from './buildFloor'
import { initKit, K, releaseKitListener } from './kit'

export interface FloorRequest {
  type: FloorType
  layout: LayoutId
  units: Unit[]
}

export interface EngineOptions {
  reducedMotion?: boolean
  /** 滑鼠在 3D 上移入／移出某一戶 */
  onHoverUnit?: (side: Side | null) => void
  /** 跟著滑鼠的小提示 */
  tooltip?: HTMLElement | null
}

export const floorKey = (r: FloorRequest) => `${r.type}|${r.layout}|${r.units.map((u) => +u.occ).join('')}`

const CENTER = new THREE.Vector3(10, 0, 17)
const VIEW_DIR = new THREE.Vector3(-0.95, 1.5, 1.2).normalize()

export class FloorPlanEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 400)
  private controls: OrbitControls
  private cache = new Map<string, BuiltFloor>()
  private current: BuiltFloor | null = null
  private currentUnits: Unit[] = []
  private hot: Side | null = null
  private dirty = true
  private anim: { t0: number; from: number } | null = null
  private fitH = 20
  private raf = 0
  private ro: ResizeObserver
  private bounds: THREE.Vector3[] = []
  private tmp = new THREE.Vector3()
  private ray = new THREE.Raycaster()
  private ndc = new THREE.Vector2()
  private onTex = () => { this.dirty = true }

  constructor(
    private view: HTMLElement,
    private labelLayer: HTMLElement,
    private opts: EngineOptions = {},
  ) {
    initKit(this.onTex)
    for (const x of [-1, 21]) for (const y of [-0.4, 2.6]) for (const z of [0, 35.6]) this.bounds.push(new THREE.Vector3(x, y, z))

    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }))
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFSoftShadowMap
    Object.assign(r.domElement.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none' })
    view.prepend(r.domElement)

    const pmrem = new THREE.PMREMGenerator(r)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    // 光線強度已換算成 three r155+ 的物理單位
    this.scene.add(new THREE.HemisphereLight('#fff6ea', '#857a6d', 1.25))
    const sun = new THREE.DirectionalLight('#ffe3bf', 4.7)
    sun.position.set(CENTER.x - 20, 34, CENTER.z - 11)
    sun.target.position.copy(CENTER)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 })
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.03
    this.scene.add(sun, sun.target)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.14 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.37
    ground.receiveShadow = true
    this.scene.add(ground)

    const c = (this.controls = new OrbitControls(this.camera, r.domElement))
    Object.assign(c, {
      enableDamping: true, dampingFactor: 0.08, enablePan: false,
      minZoom: 0.8, maxZoom: 3.5, minPolarAngle: 0.25, maxPolarAngle: 1.2, rotateSpeed: 0.55,
    })
    c.addEventListener('change', () => { this.dirty = true })

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(view)
    this.resize()
    this.resetCamera()

    r.domElement.addEventListener('pointermove', this.onPointerMove)
    r.domElement.addEventListener('pointerleave', this.onPointerLeave)
    this.loop()
  }

  /** 已建好的樓層統計（沒建過回傳 null） */
  peek(req: FloorRequest): FloorStats | null {
    return this.cache.get(floorKey(req))?.stats ?? null
  }

  /** 切換顯示的樓層，回傳該層的規劃摘要 */
  show(req: FloorRequest): FloorStats {
    const key = floorKey(req)
    let next = this.cache.get(key)
    if (!next) {
      next = buildFloor(req.type, req.layout, req.units)
      next.labels.forEach((l) => {
        const el = document.createElement('div')
        el.className = l.cls
        el.innerHTML = l.html
        l.el = el
      })
      this.cache.set(key, next)
    }
    this.currentUnits = req.units
    if (next === this.current) return next.stats
    if (this.current) {
      this.scene.remove(this.current.group)
      this.current.labels.forEach((l) => l.el?.remove())
    }
    this.current = next
    this.scene.add(next.group)
    next.labels.forEach((l) => l.el && this.labelLayer.appendChild(l.el))
    next.group.position.y = 0
    if (!this.opts.reducedMotion) this.anim = { t0: performance.now(), from: 1.6 }
    this.applyHot()
    this.dirty = true
    return next.stats
  }

  setHot(side: Side | null) {
    this.hot = side
    this.applyHot()
  }

  resetCamera() {
    const cam = this.camera
    this.controls.target.copy(CENTER)
    cam.position.copy(CENTER).addScaledVector(VIEW_DIR, 90)
    cam.zoom = 1
    cam.lookAt(CENTER)
    cam.updateMatrixWorld()
    const aspect = this.aspect()
    let mx = 0, my = 0
    for (const b of this.bounds) {
      const p = b.clone().applyMatrix4(cam.matrixWorldInverse)
      mx = Math.max(mx, Math.abs(p.x))
      my = Math.max(my, Math.abs(p.y))
    }
    this.fitH = Math.max(my, mx / aspect) * 0.97
    this.applyFrustum()
    this.controls.update()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.controls.dispose()
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.current?.labels.forEach((l) => l.el?.remove())
    const { BOX, CYL, SPH, ICO } = K()
    const shared = new Set<THREE.BufferGeometry>([BOX, CYL, SPH, ICO])
    for (const f of this.cache.values()) {
      f.group.traverse((o) => {
        if ((o instanceof THREE.Mesh || o instanceof THREE.LineSegments) && !shared.has(o.geometry)) o.geometry.dispose()
      })
    }
    this.cache.clear()
    this.renderer.dispose()
    this.renderer.domElement.remove()
    releaseKitListener(this.onTex)
  }

  /* ---------- internal ---------- */
  private aspect() {
    return this.view.clientWidth / Math.max(1, this.view.clientHeight)
  }

  private applyFrustum() {
    const a = this.aspect(), h = this.fitH
    // 上方多留一點給方案切換鈕
    Object.assign(this.camera, { left: -h * a, right: h * a, top: h * 1.1, bottom: -h * 0.9 })
    this.camera.updateProjectionMatrix()
    this.dirty = true
  }

  private resize() {
    this.renderer.setSize(this.view.clientWidth, this.view.clientHeight, false)
    this.applyFrustum()
  }

  private applyHot() {
    if (!this.current) return
    for (const [side, ring] of Object.entries(this.current.rings)) if (ring) ring.visible = side === this.hot
    this.dirty = true
  }

  private onPointerMove = (e: PointerEvent) => {
    if (!this.current || e.buttons) return
    const r = this.renderer.domElement.getBoundingClientRect()
    this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    this.ray.setFromCamera(this.ndc, this.camera)
    const hit = this.ray.intersectObjects(this.current.picks)[0]
    const side = (hit?.object.userData.side as Side | undefined) ?? null
    if (side !== this.hot) this.opts.onHoverUnit?.(side)
    const tip = this.opts.tooltip
    if (!tip) return
    const u = side ? this.currentUnits.find((x) => x.side === side) : null
    if (u) {
      tip.style.display = 'block'
      tip.style.left = `${e.clientX - r.left}px`
      tip.style.top = `${e.clientY - r.top}px`
      tip.textContent = `${u.id}　${u.area} 坪　${u.occ ? 'Occupied' : '招租中'}`
    } else tip.style.display = 'none'
  }

  private onPointerLeave = () => {
    this.opts.onHoverUnit?.(null)
    if (this.opts.tooltip) this.opts.tooltip.style.display = 'none'
  }

  private placeLabels() {
    if (!this.current) return
    const w = this.view.clientWidth, h = this.view.clientHeight, off = this.current.group.position.y
    for (const l of this.current.labels) {
      if (!l.el) continue
      this.tmp.copy(l.p)
      this.tmp.y += off
      this.tmp.project(this.camera)
      let x = (this.tmp.x * 0.5 + 0.5) * w
      if (l.cls.includes('lb-unit')) {
        const hw = (l.hw ||= l.el.offsetWidth / 2)
        if (hw) x = Math.min(Math.max(x, hw + 6), w - hw - 6)
      }
      l.el.style.transform = `translate(${x}px,${(-this.tmp.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`
    }
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    if (this.controls.update()) this.dirty = true
    if (this.anim && this.current) {
      const t = Math.min(1, (performance.now() - this.anim.t0) / 420), e = 1 - Math.pow(1 - t, 3)
      this.current.group.position.y = this.anim.from * (1 - e)
      this.dirty = true
      if (t >= 1) this.anim = null
    }
    if (this.dirty) {
      this.renderer.render(this.scene, this.camera)
      this.placeLabels()
      this.dirty = false
    }
  }
}

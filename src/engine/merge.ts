/* 把同材質的靜態 mesh 合併成一個，並為不透明物件加描邊（插畫感）。
   標了 userData.keep 的物件（貼圖地坪、圖釘、hover 框…）保留原樣。 */
import * as THREE from 'three'

export function mergeStatic(g: THREE.Group, line: THREE.LineBasicMaterial) {
  g.updateMatrixWorld(true)
  const buckets = new Map<string, { m: THREE.Material; cast: boolean; geos: THREE.BufferGeometry[] }>()
  const remove: THREE.Mesh[] = []
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || o.userData.keep || o.parent?.userData.keep) return
    const m = o.material as THREE.Material
    const key = m.uuid + (o.castShadow ? 'c' : 'n')
    if (!buckets.has(key)) buckets.set(key, { m, cast: o.castShadow, geos: [] })
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()
    geo.applyMatrix4(o.matrixWorld)
    buckets.get(key)!.geos.push(geo)
    remove.push(o)
  })
  remove.forEach((o) => o.parent?.remove(o))
  for (const b of buckets.values()) {
    let n = 0
    b.geos.forEach((q) => (n += q.attributes.position.count))
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3)
    let off = 0
    b.geos.forEach((q) => {
      pos.set(q.attributes.position.array as Float32Array, off * 3)
      nor.set(q.attributes.normal.array as Float32Array, off * 3)
      off += q.attributes.position.count
      q.dispose()
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
    geo.computeBoundingSphere()
    const mesh = new THREE.Mesh(geo, b.m)
    mesh.castShadow = b.cast
    mesh.receiveShadow = true
    if (b.m.transparent) mesh.renderOrder = 1
    g.add(mesh)
    if (!b.m.userData.noEdge) g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), line))
  }
}

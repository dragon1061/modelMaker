import * as THREE from 'three'
import type { ValveModel } from '../types'

export function buildValveGroup(model: ValveModel): THREE.Group {
  const g = new THREE.Group()
  g.name = 'ValveGroup'

  const mat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    metalness: 0.25,
    roughness: 0.55,
  })

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(model.bodyOuterDia / 2, model.bodyOuterDia / 2, model.bodyHeight, 64, 1),
    mat,
  )
  body.name = 'Body'
  g.add(body)

  const flangeGeo = new THREE.CylinderGeometry(
    model.flangeOuterDia / 2,
    model.flangeOuterDia / 2,
    model.flangeThickness,
    64,
    1,
  )

  const topFlange = new THREE.Mesh(flangeGeo, mat)
  topFlange.name = 'TopFlange'
  topFlange.position.y = model.bodyHeight / 2 + model.flangeThickness / 2
  g.add(topFlange)

  const bottomFlange = new THREE.Mesh(flangeGeo, mat)
  bottomFlange.name = 'BottomFlange'
  bottomFlange.position.y = -model.bodyHeight / 2 - model.flangeThickness / 2
  g.add(bottomFlange)

  // 外轮廓线（增加识别度）
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x111827 })
  g.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.Mesh) {
      const edges = new THREE.EdgesGeometry(obj.geometry, 20)
      const line = new THREE.LineSegments(edges, edgeMat)
      line.renderOrder = 1
      obj.add(line)
    }
  })

  // 居中 + 让底部落地
  const box = new THREE.Box3().setFromObject(g)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  g.position.sub(center)
  g.position.y += size.y / 2

  return g
}

export function disposeGroup(group: THREE.Object3D) {
  group.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose?.()
      const m = obj.material as THREE.Material | THREE.Material[]
      if (Array.isArray(m)) m.forEach((mm) => mm.dispose())
      else m?.dispose?.()
    }
    // 线段等
    if (obj instanceof THREE.LineSegments) {
      obj.geometry?.dispose?.()
      const m = obj.material as THREE.Material
      m?.dispose?.()
    }
  })
}

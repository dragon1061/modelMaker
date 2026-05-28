import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface ThreeContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  dispose: () => void
  resize: () => void
}

export function createThreeContext(container: HTMLDivElement): ThreeContext {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0b1020')

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000)
  camera.position.set(200, 180, 260)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2))
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(0, 0, 0)

  // 灯光
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223355, 1.0))
  const dir = new THREE.DirectionalLight(0xffffff, 1.1)
  dir.position.set(300, 400, 200)
  scene.add(dir)

  // 辅助：网格/坐标轴
  const grid = new THREE.GridHelper(800, 40, 0x94a3b8, 0x334155)
  grid.position.y = -0.01
  scene.add(grid)
  scene.add(new THREE.AxesHelper(120))

  let raf = 0
  const animate = () => {
    raf = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  const resize = () => {
    const w = Math.max(1, container.clientWidth)
    const h = Math.max(1, container.clientHeight)
    // 让 three 同步更新 canvas 的 CSS 尺寸，避免出现“黑屏但实际是 0 尺寸渲染”
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()

  const dispose = () => {
    cancelAnimationFrame(raf)
    controls.dispose()
    renderer.dispose()
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement)
    }
  }

  return { scene, camera, renderer, controls, dispose, resize }
}

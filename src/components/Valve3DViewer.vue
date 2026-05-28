<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as THREE from 'three'
import type { ValveModel } from '../core/types'
import { createThreeContext, type ThreeContext } from '../core/three/setup'
import { buildValveGroup, disposeGroup } from '../core/three/buildMesh'

const props = defineProps<{
  model: ValveModel | null
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let three: ThreeContext | null = null
let currentGroup: THREE.Group | null = null
let ro: ResizeObserver | null = null
const errorMsg = ref<string | null>(null)
const stats = reactive({ w: 0, h: 0, children: 0, model: 'null' as 'null' | 'ok' })

function updateModel(m: ValveModel | null) {
  if (!three) return

  if (currentGroup) {
    three.scene.remove(currentGroup)
    disposeGroup(currentGroup)
    currentGroup = null
  }

  if (!m) return
  currentGroup = buildValveGroup(m)
  three.scene.add(currentGroup)

  // 以模型实际包围盒中心为旋转目标，确保居中
  const box = new THREE.Box3().setFromObject(currentGroup)
  const center = box.getCenter(new THREE.Vector3())
  three.controls.target.copy(center)

  // 根据模型尺寸自动调整摄像机距离
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const dist = maxDim * 2.2
  const dir = three.camera.position.clone().sub(three.controls.target).normalize()
  three.camera.position.copy(center).addScaledVector(dir, dist)

  three.controls.update()
  updateStats()
}

function updateStats() {
  const el = containerRef.value
  if (el) {
    stats.w = Math.floor(el.clientWidth)
    stats.h = Math.floor(el.clientHeight)
  }
  stats.children = three?.scene.children.length ?? 0
  stats.model = props.model ? 'ok' : 'null'
}

onMounted(() => {
  if (!containerRef.value) return
  try {
    three = createThreeContext(containerRef.value)
  } catch (e) {
    errorMsg.value = `WebGL 初始化失败：${String(e)}`
    return
  }

  ro = new ResizeObserver(() => {
    three?.resize()
    updateStats()
  })
  ro.observe(containerRef.value)

  requestAnimationFrame(() => {
    three?.resize()
    updateModel(props.model)
    updateStats()
  })
})

watch(
  () => props.model,
  (m) => {
    updateModel(m)
    updateStats()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (ro && containerRef.value) ro.unobserve(containerRef.value)
  ro?.disconnect()
  ro = null

  if (three) {
    if (currentGroup) {
      three.scene.remove(currentGroup)
      disposeGroup(currentGroup)
      currentGroup = null
    }
    three.dispose()
    three = null
  }
})
</script>

<template>
  <div ref="containerRef" class="viewer3d">

    <!-- 空状态 -->
    <div v-if="!model && !errorMsg" class="placeholder">
      <div class="placeholder-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="1" y="1" width="38" height="38" stroke="rgba(245,158,11,0.2)" stroke-width="1" stroke-dasharray="4 3"/>
          <circle cx="20" cy="20" r="12" stroke="rgba(245,158,11,0.3)" stroke-width="1"/>
          <circle cx="20" cy="20" r="5"  stroke="rgba(245,158,11,0.5)" stroke-width="1"/>
          <line x1="20" y1="8"  x2="20" y2="12" stroke="rgba(245,158,11,0.4)" stroke-width="1"/>
          <line x1="20" y1="28" x2="20" y2="32" stroke="rgba(245,158,11,0.4)" stroke-width="1"/>
          <line x1="8"  y1="20" x2="12" y2="20" stroke="rgba(245,158,11,0.4)" stroke-width="1"/>
          <line x1="28" y1="20" x2="32" y2="20" stroke="rgba(245,158,11,0.4)" stroke-width="1"/>
        </svg>
      </div>
      <div class="placeholder-text">[ AWAITING PARAMETERS — CLICK GENERATE ]</div>
      <div class="placeholder-hint">DRAG TO ROTATE · SCROLL TO ZOOM</div>
    </div>

    <!-- 错误状态 -->
    <div v-if="errorMsg" class="err-overlay">
      <span class="err-icon">⚠</span>
      <span>{{ errorMsg }}</span>
    </div>

  </div>
</template>

<style scoped>
.viewer3d {
  position: relative;
  width: 100%;
  height: 100%;
  background: #080c14;
  overflow: hidden;
}

/* ── 空状态 ── */
.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  pointer-events: none;
}
.placeholder-icon {
  opacity: 0.7;
  animation: spin-slow 12s linear infinite;
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.placeholder-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(123,131,153,0.6);
}
.placeholder-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.14em;
  color: rgba(123,131,153,0.3);
}

/* ── 错误 ── */
.err-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #f87171;
  padding: 20px;
  text-align: center;
}
.err-icon { font-size: 16px; }

</style>

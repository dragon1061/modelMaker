<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { ValveModel } from '../core/types'
import { renderValve2D } from '../core/draw2d/drawValve'

const props = defineProps<{
  model: ValveModel | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ro: ResizeObserver | null = null
const stats = reactive({ w: 0, h: 0, dpr: 1 })

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return

  const rect = parent.getBoundingClientRect()
  const w = Math.max(1, Math.floor(rect.width))
  const h = Math.max(1, Math.floor(rect.height))
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
  stats.w = w
  stats.h = h
  stats.dpr = dpr
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // 暗色背景
  ctx.fillStyle = '#0d1018'
  ctx.fillRect(0, 0, w, h)

  if (!props.model) {
    // 空状态：画一层微网格 + 提示文字
    drawGrid(ctx, w, h)
    ctx.save()
    ctx.font = '400 12px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(123,131,153,0.6)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('[ AWAITING PARAMETERS — CLICK GENERATE ]', w / 2, h / 2)
    ctx.restore()
    return
  }

  // 有模型时：传入暗色主题配置给 renderValve2D
  renderValve2D({
    ctx,
    canvasWidth: w,
    canvasHeight: h,
    model: props.model,
    theme: 'dark',
  })
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const step = 30
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  // crosshair center hint
  ctx.strokeStyle = 'rgba(245,158,11,0.06)'
  ctx.setLineDash([4, 8])
  ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

onMounted(() => {
  requestAnimationFrame(() => render())
  setTimeout(() => render(), 50)
  if (!canvasRef.value?.parentElement) return
  ro = new ResizeObserver(() => render())
  ro.observe(canvasRef.value.parentElement)
})

watch(
  () => props.model,
  () => render(),
  { deep: true },
)

onBeforeUnmount(() => {
  if (ro && canvasRef.value?.parentElement) ro.unobserve(canvasRef.value.parentElement)
  ro?.disconnect()
  ro = null
})
</script>

<template>
  <div class="canvasWrap">
    <canvas ref="canvasRef" class="canvas"></canvas>
  </div>
</template>

<style scoped>
.canvasWrap {
  width: 100%;
  height: 100%;
  background: #0d1018;
  position: relative;
  overflow: hidden;
}
.canvas {
  display: block;
}
</style>

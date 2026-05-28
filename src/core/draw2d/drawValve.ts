import type { ValveModel } from '../types'
import { makeViewport2D, type BBox2D } from './project'
import {
  drawCenterLineX,
  drawCenterLineY,
  drawDimHorizontal,
  drawDimVertical,
  drawLine,
  drawRect,
  drawText,
} from './primitives'

export interface DrawValve2DTheme {
  bg: string
  grid: string
  gridCenter: string
  body: string
  bore: string
  centerLine: string
  dimLine: string
  dimText: string
  titleText: string
  titleFont: string
}

const LIGHT_THEME: DrawValve2DTheme = {
  bg: '#ffffff',
  grid: 'rgba(148,163,184,0.25)',
  gridCenter: 'rgba(37,99,235,0.08)',
  body: '#111827',
  bore: '#2563eb',
  centerLine: '#9ca3af',
  dimLine: '#6b7280',
  dimText: '#111827',
  titleText: '#111827',
  titleFont: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
}

const DARK_THEME: DrawValve2DTheme = {
  bg: '#0d1018',
  grid: 'rgba(255,255,255,0.04)',
  gridCenter: 'rgba(245,158,11,0.08)',
  body: '#c8cdd8',
  bore: '#00d9b4',
  centerLine: 'rgba(245,158,11,0.45)',
  dimLine: 'rgba(123,131,153,0.8)',
  dimText: '#8b93a8',
  titleText: '#7b8399',
  titleFont: '"JetBrains Mono", monospace',
}

export function renderValve2D(args: {
  ctx: CanvasRenderingContext2D
  canvasWidth: number
  canvasHeight: number
  model: ValveModel
  theme?: 'light' | 'dark'
}) {
  const { ctx, canvasWidth, canvasHeight, model } = args
  const T = args.theme === 'dark' ? DARK_THEME : LIGHT_THEME

  // 世界坐标（mm）：以阀门中心为原点
  const halfH = model.totalHeight / 2
  const halfDf = model.flangeOuterDia / 2
  const halfBody = model.bodyOuterDia / 2
  const halfDn = model.boreDia / 2
  const t = model.flangeThickness

  // 给尺寸标注预留空间（mm）
  const dimPadX = Math.max(halfDf * 0.25, 25)
  const dimPadY = Math.max(halfH * 0.25, 25)

  const bbox: BBox2D = {
    minX: -halfDf - dimPadX,
    maxX: halfDf + dimPadX,
    minY: -halfH - dimPadY,
    maxY: halfH + dimPadY,
  }

  const vp = makeViewport2D({ bbox, canvasWidth, canvasHeight, paddingPx: 18 })

  // 背景
  ctx.fillStyle = T.bg
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 背景网格
  drawGrid(ctx, vp, bbox, T)

  // 中心线
  drawCenterLineY(ctx, vp, 0, -halfH, halfH, T.centerLine)
  drawCenterLineX(ctx, vp, 0, -halfDf, halfDf, T.centerLine)

  // 下法兰
  drawRect(ctx, vp, -halfDf, -halfH, model.flangeOuterDia, t, {
    strokeStyle: T.body,
    lineWidthPx: 2,
  })

  // 上法兰
  drawRect(ctx, vp, -halfDf, halfH - t, model.flangeOuterDia, t, {
    strokeStyle: T.body,
    lineWidthPx: 2,
  })

  // 阀体
  drawRect(ctx, vp, -halfBody, -halfH + t, model.bodyOuterDia, model.bodyHeight, {
    strokeStyle: T.body,
    lineWidthPx: 2,
  })

  // 流道（用两条竖线表示内孔）
  drawLine(ctx, vp, -halfDn, -halfH + t, -halfDn, halfH - t, {
    strokeStyle: T.bore,
    lineWidthPx: 2,
  })
  drawLine(ctx, vp, halfDn, -halfH + t, halfDn, halfH - t, {
    strokeStyle: T.bore,
    lineWidthPx: 2,
  })

  // 标题
  drawText(ctx, vp, 0, bbox.maxY - dimPadY * 0.35, '阀门参数化 2D 工程图（简化示意）', {
    fillStyle: T.titleText,
    fontPx: 12,
    fontFamily: T.titleFont,
  })

  // 尺寸标注：Df、Dn、H、t
  drawDimHorizontal(
    ctx, vp,
    -halfDf, halfDf, halfH - t, +dimPadY * 0.45,
    `Df = ${model.flangeOuterDia.toFixed(0)} mm`,
    T,
  )
  drawDimHorizontal(
    ctx, vp,
    -halfDn, halfDn, 0, -dimPadY * 0.55,
    `Dn = ${model.boreDia.toFixed(0)} mm`,
    T,
  )
  drawDimVertical(
    ctx, vp,
    -halfH, halfH, halfDf, +dimPadX * 0.55,
    `H = ${model.totalHeight.toFixed(0)} mm`,
    T,
  )
  drawDimVertical(
    ctx, vp,
    halfH - t, halfH, -halfDf, -dimPadX * 0.55,
    `t = ${t.toFixed(0)} mm`,
    T,
  )
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  vp: ReturnType<typeof makeViewport2D>,
  bbox: BBox2D,
  T: DrawValve2DTheme,
) {
  const step = pickGridStep(bbox)
  for (let x = Math.floor(bbox.minX / step) * step; x <= bbox.maxX; x += step) {
    drawLine(ctx, vp, x, bbox.minY, x, bbox.maxY, { strokeStyle: T.grid })
  }
  for (let y = Math.floor(bbox.minY / step) * step; y <= bbox.maxY; y += step) {
    drawLine(ctx, vp, bbox.minX, y, bbox.maxX, y, { strokeStyle: T.grid })
  }
  // 中轴辅助线
  ctx.save()
  ctx.strokeStyle = T.gridCenter
  ctx.setLineDash([4, 8])
  ctx.lineWidth = 1
  const cx = vp.worldToCanvas(0, 0)
  const top = vp.worldToCanvas(0, bbox.maxY)
  const bot = vp.worldToCanvas(0, bbox.minY)
  const lft = vp.worldToCanvas(bbox.minX, 0)
  const rgt = vp.worldToCanvas(bbox.maxX, 0)
  ctx.beginPath()
  ctx.moveTo(cx.x, top.y); ctx.lineTo(cx.x, bot.y)
  ctx.moveTo(lft.x, cx.y); ctx.lineTo(rgt.x, cx.y)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function pickGridStep(bbox: BBox2D) {
  const w = bbox.maxX - bbox.minX
  const target = w / 16
  const candidates = [5, 10, 20, 25, 50, 100, 200, 500]
  return candidates.reduce((best, c) => (Math.abs(c - target) < Math.abs(best - target) ? c : best), candidates[0])
}

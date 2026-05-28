import type { Viewport2D } from './project'
import type { DrawValve2DTheme } from './drawValve'

export interface DrawStyle {
  strokeStyle?: string
  fillStyle?: string
  lineWidthPx?: number
  dash?: number[]
  fontPx?: number
  fontFamily?: string
}

export function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: DrawStyle = {},
) {
  ctx.save()
  applyStyle(ctx, style)
  const p1 = vp.worldToCanvas(x1, y1)
  const p2 = vp.worldToCanvas(x2, y2)
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
  ctx.restore()
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: DrawStyle = {},
) {
  ctx.save()
  applyStyle(ctx, style)
  const p = vp.worldToCanvas(x, y)
  const p2 = vp.worldToCanvas(x + w, y + h)
  const left = Math.min(p.x, p2.x)
  const top = Math.min(p.y, p2.y)
  const width = Math.abs(p2.x - p.x)
  const height = Math.abs(p2.y - p.y)
  ctx.beginPath()
  ctx.rect(left, top, width, height)
  if (style.fillStyle) ctx.fill()
  if (style.strokeStyle !== 'transparent') ctx.stroke()
  ctx.restore()
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  x: number,
  y: number,
  text: string,
  style: DrawStyle = {},
) {
  ctx.save()
  applyStyle(ctx, style)
  const p = vp.worldToCanvas(x, y)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, p.x, p.y)
  ctx.restore()
}

export function drawDimHorizontal(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  x1: number,
  x2: number,
  y: number,
  offset: number,
  label: string,
  T: DrawValve2DTheme,
) {
  const yDim = y + offset
  drawLine(ctx, vp, x1, y,    x1, yDim, { strokeStyle: T.dimLine, lineWidthPx: 1 })
  drawLine(ctx, vp, x2, y,    x2, yDim, { strokeStyle: T.dimLine, lineWidthPx: 1 })
  drawLine(ctx, vp, x1, yDim, x2, yDim, { strokeStyle: T.dimLine, lineWidthPx: 1 })
  drawArrow(ctx, vp, x1, yDim,  1, 0, T.dimLine)
  drawArrow(ctx, vp, x2, yDim, -1, 0, T.dimLine)
  drawText(ctx, vp, (x1 + x2) / 2, yDim + offset * 0.35, label, {
    fillStyle: T.dimText,
    fontPx: 11,
    fontFamily: T.titleFont,
  })
}

export function drawDimVertical(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  y1: number,
  y2: number,
  x: number,
  offset: number,
  label: string,
  T: DrawValve2DTheme,
) {
  const xDim = x + offset
  drawLine(ctx, vp, x,    y1, xDim, y1, { strokeStyle: T.dimLine, lineWidthPx: 1 })
  drawLine(ctx, vp, x,    y2, xDim, y2, { strokeStyle: T.dimLine, lineWidthPx: 1 })
  drawLine(ctx, vp, xDim, y1, xDim, y2, { strokeStyle: T.dimLine, lineWidthPx: 1 })
  drawArrow(ctx, vp, xDim, y1, 0,  1, T.dimLine)
  drawArrow(ctx, vp, xDim, y2, 0, -1, T.dimLine)
  drawText(ctx, vp, xDim + offset * 0.4, (y1 + y2) / 2, label, {
    fillStyle: T.dimText,
    fontPx: 11,
    fontFamily: T.titleFont,
  })
}

export function drawCenterLineX(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  y: number,
  xMin: number,
  xMax: number,
  color?: string,
) {
  drawLine(ctx, vp, xMin, y, xMax, y, {
    strokeStyle: color ?? '#9ca3af',
    lineWidthPx: 1,
    dash: [6, 4],
  })
}

export function drawCenterLineY(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  x: number,
  yMin: number,
  yMax: number,
  color?: string,
) {
  drawLine(ctx, vp, x, yMin, x, yMax, {
    strokeStyle: color ?? '#9ca3af',
    lineWidthPx: 1,
    dash: [6, 4],
  })
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  vp: Viewport2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color = '#6b7280',
) {
  const p = vp.worldToCanvas(x, y)
  const len = 8
  const nx = -dy
  const ny = dx

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x - dx * len + nx * (len * 0.5), p.y - dy * len + ny * (len * 0.5))
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x - dx * len - nx * (len * 0.5), p.y - dy * len - ny * (len * 0.5))
  ctx.stroke()
  ctx.restore()
}

function applyStyle(ctx: CanvasRenderingContext2D, style: DrawStyle) {
  if (style.strokeStyle) ctx.strokeStyle = style.strokeStyle
  if (style.fillStyle)   ctx.fillStyle   = style.fillStyle
  ctx.lineWidth = style.lineWidthPx ?? 1
  ctx.setLineDash(style.dash ?? [])
  const family = style.fontFamily ?? 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  ctx.font = `${style.fontPx ?? 12}px ${family}`
}

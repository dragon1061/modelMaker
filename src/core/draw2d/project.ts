export interface BBox2D {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface Viewport2D {
  scale: number
  offsetX: number
  offsetY: number
  worldToCanvas: (x: number, y: number) => { x: number; y: number }
}

export function makeViewport2D(args: {
  bbox: BBox2D
  canvasWidth: number
  canvasHeight: number
  paddingPx?: number
}): Viewport2D {
  const paddingPx = args.paddingPx ?? 24
  const bw = Math.max(1e-6, args.bbox.maxX - args.bbox.minX)
  const bh = Math.max(1e-6, args.bbox.maxY - args.bbox.minY)

  const scale = Math.min(
    (args.canvasWidth - 2 * paddingPx) / bw,
    (args.canvasHeight - 2 * paddingPx) / bh,
  )

  const cxWorld = (args.bbox.minX + args.bbox.maxX) / 2
  const cyWorld = (args.bbox.minY + args.bbox.maxY) / 2
  const cxCanvas = args.canvasWidth / 2
  const cyCanvas = args.canvasHeight / 2

  // y 轴翻转：世界坐标向上为正，canvas 向下为正
  const worldToCanvas = (x: number, y: number) => ({
    x: cxCanvas + (x - cxWorld) * scale,
    y: cyCanvas - (y - cyWorld) * scale,
  })

  return {
    scale,
    offsetX: cxCanvas - cxWorld * scale,
    offsetY: cyCanvas + cyWorld * scale,
    worldToCanvas,
  }
}


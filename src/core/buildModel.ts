import type { ValveModel, ValveParams } from './types'

/**
 * 参数 -> 统一几何模型（中间层）
 * 说明：这里采用“阀体圆柱 + 上下法兰圆盘”的简化外形，优先保证联动与一致性。
 */
export function buildValveModel(params: ValveParams): ValveModel {
  const flangeThickness = params.t
  const flangeOuterDia = params.df
  const boreDia = params.dn
  const totalHeight = params.h
  const bodyHeight = totalHeight - 2 * flangeThickness

  // 阀体外径：口径 + 壁厚*2 的简化推导，并限制不超过法兰外径（留一点边）
  const minBodyOuter = boreDia + 2 * flangeThickness
  const maxBodyOuter = flangeOuterDia - 2 * flangeThickness
  const bodyOuterDia = clamp(boreDia + 4 * flangeThickness, minBodyOuter, maxBodyOuter)

  return {
    params,
    bodyOuterDia,
    bodyHeight,
    flangeOuterDia,
    flangeThickness,
    boreDia,
    totalHeight,
  }
}

function clamp(v: number, min: number, max: number) {
  if (max < min) return min
  return Math.max(min, Math.min(max, v))
}


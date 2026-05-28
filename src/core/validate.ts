import type { ValveParams } from './types'

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

export function validateParams(p: ValveParams): ValidationResult {
  const errors: string[] = []

  const isPos = (v: number) => Number.isFinite(v) && v > 0
  if (!isPos(p.dn)) errors.push('口径必须为正数（mm）')
  if (!isPos(p.h)) errors.push('高度必须为正数（mm）')
  if (!isPos(p.df)) errors.push('法兰直径必须为正数（mm）')
  if (!isPos(p.t)) errors.push('厚度必须为正数（mm）')

  if (errors.length) return { ok: false, errors }

  // 逻辑约束（Demo 级别，够用即可）
  if (p.h <= 2 * p.t) errors.push('高度需要大于 2×厚度（上下法兰各占一层厚度）')
  if (p.df <= p.dn + 2 * p.t) errors.push('法兰直径需要大于 口径 + 2×厚度')
  if (p.t > p.df / 5) errors.push('厚度过大（建议 t <= df/5）')

  return { ok: errors.length === 0, errors }
}


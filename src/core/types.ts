export interface ValveParams {
  /** 口径（流道直径，mm） */
  dn: number
  /** 总高度（mm） */
  h: number
  /** 法兰外径（mm） */
  df: number
  /** 厚度（法兰厚度，mm） */
  t: number
}

/**
 * 统一“中间层”几何描述：2D/3D 都以它为准，避免不一致
 */
export interface ValveModel {
  params: ValveParams

  /** 阀体外径（mm） */
  bodyOuterDia: number
  /** 阀体高度（不含法兰，mm） */
  bodyHeight: number

  /** 法兰外径（mm） */
  flangeOuterDia: number
  /** 单侧法兰厚度（mm） */
  flangeThickness: number

  /** 流道直径（mm） */
  boreDia: number
  /** 总高度（mm） */
  totalHeight: number
}


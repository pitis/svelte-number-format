export interface NumberFormatValues {
  floatValue: number | undefined
  formattedValue: string
  value: string
}

export type ValueChangeSource = 'event' | 'prop'

export interface SourceInfo {
  event: Event | undefined
  source: ValueChangeSource
}

export type OnValueChange = (
  values: NumberFormatValues,
  sourceInfo: SourceInfo
) => void

export function toFloat(raw: string | null | undefined): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

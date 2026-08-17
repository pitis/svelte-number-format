<script lang="ts">
  import type { NumberInputOptions } from 'intl-number-input'
  import { NumberFormatStyle } from 'intl-number-input'
  import { defaultLocale } from './internal/env.js'

  export type NumericTextOptions = Partial<NumberInputOptions> & {
    /**
     * When true and formatStyle is Currency, negative values render with
     * accounting-style parentheses (e.g. ($1,234.56) instead of -$1,234.56).
     * Maps to Intl.NumberFormat's `currencySign: 'accounting'`.
     */
    accountingSign?: boolean
  }

  interface Props {
    value?: number | string | null
    locale?: string
    options?: NumericTextOptions
    fallback?: string
    [key: string]: unknown
  }

  let {
    value = null,
    locale,
    options = {},
    fallback = '',
    ...restProps
  }: Props = $props()

  const numericValue = $derived.by(() => {
    if (value == null || value === '') return null
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) ? n : null
  })

  function toIntlOptions(opts: NumericTextOptions): Intl.NumberFormatOptions {
    const out: Intl.NumberFormatOptions = {}

    if (opts.formatStyle === NumberFormatStyle.Currency) {
      out.style = 'currency'
      if (opts.currency) out.currency = opts.currency
      if (opts.currencyDisplay)
        out.currencyDisplay = opts.currencyDisplay as
          'symbol' | 'code' | 'name' | 'narrowSymbol'
      if (opts.accountingSign) {
        out.currencySign = 'accounting'
      }
    } else if (opts.formatStyle === NumberFormatStyle.Percent) {
      out.style = 'percent'
    } else if (opts.formatStyle === NumberFormatStyle.Unit) {
      out.style = 'unit'
    }

    if (typeof opts.precision === 'number') {
      out.minimumFractionDigits = opts.precision
      out.maximumFractionDigits = opts.precision
    } else if (opts.precision && typeof opts.precision === 'object') {
      const p = opts.precision as { min?: number; max?: number }
      if (typeof p.min === 'number') out.minimumFractionDigits = p.min
      if (typeof p.max === 'number') out.maximumFractionDigits = p.max
    }

    if (opts.useGrouping === false) out.useGrouping = false

    return out
  }

  const formatted = $derived.by(() => {
    if (numericValue == null) return fallback
    try {
      const intl = new Intl.NumberFormat(
        locale ?? defaultLocale(),
        toIntlOptions(options)
      )
      return intl.format(numericValue)
    } catch {
      return fallback
    }
  })
</script>

<span {...restProps}>{formatted}</span>

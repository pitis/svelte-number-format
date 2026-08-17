<script lang="ts">
  import { NumberInput } from 'intl-number-input'
  import type { NumberInputOptions, NumberInputValue } from 'intl-number-input'
  import { defaultLocale } from './internal/env.js'
  import type { OnValueChange } from './internal/values.js'

  export type NumericValueType = 'number' | 'string'

  interface Props {
    value?: number | string | null
    valueType?: NumericValueType
    name?: string
    form?: string
    disabled?: boolean
    locale?: string
    options?: Partial<NumberInputOptions>
    onInput?: (raw: number | null, formatted: string | null) => void
    onChange?: (raw: number | null, formatted: string | null) => void
    onValueChange?: OnValueChange
    [key: string]: unknown
  }

  let {
    value = $bindable(null),
    valueType = 'number',
    name,
    form,
    disabled,
    locale,
    options = {},
    onInput = () => {},
    onChange = () => {},
    onValueChange,
    ...restProps
  }: Props = $props()

  function toValueProp(n: number | null): number | string | null {
    if (n == null) return null
    return valueType === 'string' ? String(n) : n
  }

  function numericFromValue(v: number | string | null): number | null {
    if (v == null) return null
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    // Number('') is 0 — an empty form value must stay empty, not become zero.
    if (v.trim() === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  function emitValueChange(val: NumberInputValue, event: Event | undefined) {
    onValueChange?.(
      {
        floatValue: val.number ?? undefined,
        formattedValue: val.formatted ?? '',
        value: val.number != null ? String(val.number) : ''
      },
      { event, source: event ? 'event' : 'prop' }
    )
  }

  let inputEl: HTMLInputElement | null = null
  let hiddenEl = $state<HTMLInputElement | null>(null)
  let numberInput: NumberInput | null = null
  let isFocused = $state(false)
  // Raw value mirrored into the hidden input; initialized here (not in an
  // effect) so SSR output already contains it.
  let rawValue = $state<number | null>(numericFromValue(value))

  $effect(() => {
    if (!inputEl) return

    numberInput?.destroy?.()

    numberInput = new NumberInput({
      el: inputEl,
      options: {
        locale: locale ?? defaultLocale(),
        ...options
      },
      onInput: (val: NumberInputValue) => {
        rawValue = val.number ?? null
        onInput?.(val.number ?? null, val.formatted ?? null)
        emitValueChange(val, new Event('input'))
      },
      onChange: (val: NumberInputValue) => {
        rawValue = val.number ?? null
        value = toValueProp(val.number ?? null)
        onChange?.(val.number ?? null, val.formatted ?? null)
        emitValueChange(val, new Event('change'))
      }
    })

    const numeric = numericFromValue(value)
    if (numeric != null) {
      numberInput.setValue(numeric)
    }

    return () => {
      numberInput?.destroy?.()
      numberInput = null
    }
  })

  $effect(() => {
    if (!numberInput) return
    if (isFocused) return
    numberInput.setValue(numericFromValue(value))
    // setValue short-circuits (no callback) when the number is unchanged, and
    // clamps out-of-range values — read the settled value back so the hidden
    // input always matches what the visible input displays.
    const settled = numberInput.getValue() as NumberInputValue | undefined
    rawValue = settled?.number ?? null
  })

  // Native form reset restores the hidden input to its stale value attribute
  // (Svelte keeps the attribute — i.e. defaultValue — in step with the current
  // value). Clear our state on reset instead, so the submitted value matches
  // the cleared visible input. Listens on document (reset bubbles) so the
  // form owner is resolved at event time, not mount time.
  $effect(() => {
    if (!hiddenEl) return
    const onReset = (e: Event) => {
      if (hiddenEl && e.target === hiddenEl.form) {
        rawValue = null
        value = null
      }
    }
    document.addEventListener('reset', onReset)
    return () => document.removeEventListener('reset', onReset)
  })

  function handleFocus() {
    isFocused = true
  }

  function handleBlur() {
    isFocused = false
    try {
      const cur = numberInput?.getValue?.() as NumberInputValue | undefined
      if (cur) {
        value = toValueProp(cur.number ?? null)
      } else if (inputEl?.value) {
        const parsed = Number(inputEl.value.replace(/\s/g, ''))
        value = toValueProp(Number.isFinite(parsed) ? parsed : null)
      } else {
        value = null
      }
      rawValue = numericFromValue(value)
    } catch (ex) {
      console.error(ex)
    }
  }
</script>

<input
  bind:this={inputEl}
  onfocus={handleFocus}
  onblur={handleBlur}
  {form}
  {disabled}
  {...restProps}
/>
{#if name}
  <input
    bind:this={hiddenEl}
    type="hidden"
    {name}
    {form}
    {disabled}
    value={rawValue != null ? String(rawValue) : ''}
  />
{/if}

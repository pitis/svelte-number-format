<script lang="ts">
  import { untrack } from 'svelte'
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

  // Attribution for the setValue call in flight; 'silent' skips the emission
  // (only onValueChange is gated — rawValue and the legacy onInput/onChange
  // props always run). Callbacks fire synchronously inside setValue, but are
  // skipped when the number is unchanged — so call sites reset in `finally`.
  let emitSource: 'event' | 'prop' | 'silent' = 'event'

  function emitValueChange(val: NumberInputValue, type: 'input' | 'change') {
    if (emitSource === 'silent') return
    onValueChange?.(
      {
        floatValue: val.number ?? undefined,
        formattedValue: val.formatted ?? '',
        value: val.number != null ? String(val.number) : ''
      },
      {
        event: emitSource === 'event' ? new Event(type) : undefined,
        source: emitSource
      }
    )
  }

  let inputEl: HTMLInputElement | null = null
  let hiddenEl = $state<HTMLInputElement | null>(null)
  let numberInput: NumberInput | null = null
  let isFocused = $state(false)
  let firstInit = true
  // True only while `new NumberInput(...)` runs: the constructor's re-parse of
  // el.value must not be written back into the bound value.
  let constructing = false
  // Raw value mirrored into the hidden input; initialized here (not in an
  // effect) so SSR output already contains it.
  let rawValue = $state<number | null>(numericFromValue(value))

  $effect(() => {
    if (!inputEl) return

    numberInput?.destroy?.()

    // Read the seed BEFORE constructing: the constructor re-parses el.value
    // under the new locale (en-US "1,234.56" → de-DE 1.23). untrack keeps this
    // effect on locale/options only — external value changes belong to the
    // prop-sync effect below, which preserves the caret.
    const numeric = untrack(() => numericFromValue(value))

    emitSource = 'silent'
    try {
      constructing = true
      numberInput = new NumberInput({
        el: inputEl,
        options: {
          locale: locale ?? defaultLocale(),
          ...options
        },
        onInput: (val: NumberInputValue) => {
          rawValue = val.number ?? null
          onInput?.(val.number ?? null, val.formatted ?? null)
          emitValueChange(val, 'input')
        },
        onChange: (val: NumberInputValue) => {
          rawValue = val.number ?? null
          if (!constructing) {
            value = toValueProp(val.number ?? null)
          }
          onChange?.(val.number ?? null, val.formatted ?? null)
          emitValueChange(val, 'change')
        }
      })
      constructing = false

      if (numeric != null) {
        // Mount emits nothing (onValueChange reports changes only); a
        // locale/options re-init reports the re-seeded value as 'prop'.
        emitSource = firstInit ? 'silent' : 'prop'
        numberInput.setValue(numeric)
      }
      firstInit = false
    } finally {
      constructing = false
      emitSource = 'event'
    }

    return () => {
      numberInput?.destroy?.()
      numberInput = null
    }
  })

  $effect(() => {
    if (!numberInput) return
    if (isFocused) return
    emitSource = 'prop'
    try {
      numberInput.setValue(numericFromValue(value))
    } finally {
      emitSource = 'event'
    }
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

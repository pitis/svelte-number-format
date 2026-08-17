<script lang="ts">
  import {
    applyMask,
    calculateCursorPosition,
    firstTokenIndex,
    generatePlaceholder,
    isBuiltinToken,
    isPatternToken,
    type CustomPatterns
  } from './internal/cursor.js'
  import { inferInputMode } from './internal/inputmode.js'
  import { toFloat, type OnValueChange } from './internal/values.js'

  interface Props {
    value?: string | null
    format?: string
    name?: string
    form?: string
    disabled?: boolean
    maskChar?: string
    placeholder?: string
    customPatterns?: CustomPatterns
    allowEmptyFormatting?: boolean
    onInput?: (value: string | null, formatted: string | null) => void
    onChange?: (value: string | null, formatted: string | null) => void
    onValueChange?: OnValueChange
    [key: string]: unknown
  }

  let {
    value = $bindable(null),
    format = '',
    name,
    form,
    disabled,
    maskChar = '_',
    placeholder = '',
    customPatterns,
    allowEmptyFormatting = false,
    onInput = () => {},
    onChange = () => {},
    onValueChange,
    ...restProps
  }: Props = $props()

  const isDev =
    typeof import.meta !== 'undefined' &&
    Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV)

  let warnedCustomPatternCollision = false

  $effect(() => {
    if (isDev && customPatterns && !warnedCustomPatternCollision) {
      for (const key of Object.keys(customPatterns)) {
        if (isBuiltinToken(key)) {
          warnedCustomPatternCollision = true
          console.warn(
            `[svelte-number-format] customPatterns key "${key}" collides with a built-in token (#, A, or *). The built-in takes precedence.`
          )
          break
        }
      }
    }
  })

  const pattern = $derived(format)
  const autoPlaceholder = $derived(
    generatePlaceholder(pattern, maskChar, customPatterns)
  )
  const resolvedPlaceholder = $derived(placeholder || autoPlaceholder)
  const inferredInputMode = $derived(inferInputMode(pattern))
  // The hidden input must submit the same mask-filtered raw string the
  // visible input displays — a parent-provided value never goes through
  // commit(), so normalize it here.
  const submittedValue = $derived(
    value == null || value === ''
      ? ''
      : pattern
        ? applyMask(value, pattern, customPatterns).raw
        : value
  )

  let inputEl: HTMLInputElement | null = null
  let hiddenEl = $state<HTMLInputElement | null>(null)
  let isFocused = false
  let isComposing = false

  // Native form reset restores the hidden input to its stale value attribute
  // (Svelte keeps the attribute — i.e. defaultValue — in step with the current
  // value). Clear our state on reset instead, so the submitted value matches
  // the cleared visible input. Listens on document (reset bubbles) so the
  // form owner is resolved at event time, not mount time.
  $effect(() => {
    if (!hiddenEl) return
    const onReset = (e: Event) => {
      if (hiddenEl && e.target === hiddenEl.form) {
        value = null
      }
    }
    document.addEventListener('reset', onReset)
    return () => document.removeEventListener('reset', onReset)
  })

  function formatValue(val: string | null): string {
    if (!val || !pattern) return val || ''
    return applyMask(val, pattern, customPatterns).masked
  }

  function commit(
    target: HTMLInputElement,
    rawInput: string,
    prevCursor: number
  ): { raw: string; masked: string; nextCursor: number } {
    const { raw, masked } = applyMask(rawInput, pattern, customPatterns)
    target.value = masked
    const nextCursor = calculateCursorPosition(
      prevCursor,
      rawInput,
      masked,
      pattern,
      customPatterns
    )
    target.setSelectionRange(nextCursor, nextCursor)
    value = raw || null
    return { raw, masked, nextCursor }
  }

  function emitValueChange(
    raw: string,
    masked: string,
    event: Event | undefined
  ) {
    onValueChange?.(
      {
        floatValue: toFloat(raw),
        formattedValue: masked,
        value: raw
      },
      { event, source: event ? 'event' : 'prop' }
    )
  }

  function handleInput(e: Event) {
    if (isComposing) return
    const target = e.target as HTMLInputElement
    const prevCursor = target.selectionStart ?? 0
    const { raw, masked } = commit(target, target.value, prevCursor)
    onInput?.(raw || null, masked || null)
    emitValueChange(raw, masked, e)
  }

  function handleCompositionStart() {
    isComposing = true
  }

  function handleCompositionEnd(e: CompositionEvent) {
    isComposing = false
    const target = e.target as HTMLInputElement
    const prevCursor = target.selectionStart ?? 0
    const { raw, masked } = commit(target, target.value, prevCursor)
    onInput?.(raw || null, masked || null)
    emitValueChange(raw, masked, e)
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement
    const { raw, masked } = applyMask(target.value, pattern, customPatterns)
    target.value = masked
    value = raw || null
    onChange?.(raw || null, masked || null)
    emitValueChange(raw, masked, e)
  }

  function handlePaste(e: ClipboardEvent) {
    if (!pattern) return
    const target = e.target as HTMLInputElement
    const clipboard = e.clipboardData?.getData('text')
    if (clipboard == null) return

    e.preventDefault()

    const selStart = target.selectionStart ?? target.value.length
    const selEnd = target.selectionEnd ?? target.value.length
    const merged =
      target.value.slice(0, selStart) + clipboard + target.value.slice(selEnd)
    const cursorAfterPaste = selStart + clipboard.length

    const { raw, masked } = commit(target, merged, cursorAfterPaste)
    onInput?.(raw || null, masked || null)
    emitValueChange(raw, masked, e)
  }

  function handleKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement

    if (e.key === 'Backspace') {
      const cursor = target.selectionStart ?? 0

      if (cursor > 0 && pattern) {
        const patternChar = pattern[cursor - 1]

        if (patternChar && !isPatternToken(patternChar, customPatterns)) {
          e.preventDefault()
          const nextValue =
            target.value.substring(0, cursor - 1) +
            target.value.substring(cursor)
          target.value = nextValue
          target.setSelectionRange(cursor - 1, cursor - 1)
          handleInput(new Event('input'))
        }
      }
    }
  }

  function handleFocus() {
    isFocused = true

    if (allowEmptyFormatting && pattern && !value && inputEl) {
      const skeleton = autoPlaceholder
      if (inputEl.value !== skeleton) {
        inputEl.value = skeleton
      }
      const slot = firstTokenIndex(pattern, customPatterns)
      queueMicrotask(() => inputEl?.setSelectionRange(slot, slot))
    }
  }

  function handleBlur() {
    isFocused = false
  }

  $effect(() => {
    if (!inputEl) return
    if (value != null && value !== '') {
      inputEl.value = formatValue(value)
    } else if (allowEmptyFormatting && pattern && !isFocused) {
      inputEl.value = autoPlaceholder
    }
  })

  $effect(() => {
    if (!inputEl) return
    if (isFocused) return
    if (value != null && value !== '') {
      inputEl.value = formatValue(value)
    } else {
      inputEl.value = allowEmptyFormatting && pattern ? autoPlaceholder : ''
    }
  })
</script>

<input
  bind:this={inputEl}
  oninput={handleInput}
  onchange={handleChange}
  onpaste={handlePaste}
  onkeydown={handleKeyDown}
  onfocus={handleFocus}
  onblur={handleBlur}
  oncompositionstart={handleCompositionStart}
  oncompositionend={handleCompositionEnd}
  placeholder={resolvedPlaceholder}
  aria-placeholder={resolvedPlaceholder || undefined}
  inputmode={inferredInputMode}
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
    value={submittedValue}
  />
{/if}

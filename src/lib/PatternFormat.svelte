<script lang="ts">
  interface Props {
    value?: string | null
    format?: string
    mask?: string // deprecated, use format
    maskChar?: string
    placeholder?: string
    onInput?: (value: string | null, formatted: string | null) => void
    onChange?: (value: string | null, formatted: string | null) => void
    [key: string]: unknown
  }

  let {
    value = $bindable(null),
    format = '',
    mask = '', // deprecated
    maskChar = '_',
    placeholder = '',
    onInput = () => {},
    onChange = () => {},
    ...restProps
  }: Props = $props()

  // Use format if provided, otherwise fall back to mask for backwards compatibility
  const pattern = $derived(format || mask)

  let inputEl: HTMLInputElement | null = null
  let cursorPosition = 0

  // Pattern definitions:
  // # = digit (0-9)
  // A = letter (a-z, A-Z)
  // * = alphanumeric
  // all other characters are literals

  function isValidChar(char: string, pattern: string): boolean {
    switch (pattern) {
      case '#':
        return /\d/.test(char)
      case 'A':
        return /[a-zA-Z]/.test(char)
      case '*':
        return /[a-zA-Z0-9]/.test(char)
      default:
        return char === pattern
    }
  }

  function applyMask(
    inputValue: string,
    maskPattern: string
  ): { masked: string; raw: string } {
    if (!maskPattern) {
      return { masked: inputValue, raw: inputValue }
    }

    let raw = ''
    let masked = ''
    let valueIndex = 0
    let maskIndex = 0

    while (maskIndex < maskPattern.length && valueIndex < inputValue.length) {
      const maskChar = maskPattern[maskIndex]
      const inputChar = inputValue[valueIndex]

      if (maskChar === '#' || maskChar === 'A' || maskChar === '*') {
        if (isValidChar(inputChar, maskChar)) {
          masked += inputChar
          raw += inputChar
          maskIndex++
          valueIndex++
        } else {
          valueIndex++
        }
      } else {
        // Literal character in mask
        masked += maskChar
        maskIndex++

        // If input matches the literal, skip it
        if (inputChar === maskChar) {
          valueIndex++
        }
      }
    }

    return { masked, raw }
  }

  function formatValue(val: string | null): string {
    if (!val || !pattern) return val || ''
    const result = applyMask(val, pattern)
    return result.masked
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    const inputValue = target.value

    // Store cursor position before formatting
    cursorPosition = target.selectionStart || 0

    const result = applyMask(inputValue, pattern)
    const formatted = result.masked

    // Update the display value
    target.value = formatted

    // Calculate new cursor position
    let newCursorPos = cursorPosition
    if (formatted.length > inputValue.length) {
      // Mask characters were added, adjust cursor
      newCursorPos = Math.min(cursorPosition + 1, formatted.length)
    }

    // Restore cursor position
    target.setSelectionRange(newCursorPos, newCursorPos)

    // Update bound value with raw value
    value = result.raw || null

    // Call callback
    onInput?.(result.raw || null, formatted || null)
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement
    const result = applyMask(target.value, pattern)

    value = result.raw || null
    target.value = result.masked

    onChange?.(result.raw || null, result.masked || null)
  }

  function handleKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement

    // Allow backspace to work properly with pattern
    if (e.key === 'Backspace') {
      cursorPosition = target.selectionStart || 0

      if (cursorPosition > 0 && pattern) {
        const patternChar = pattern[cursorPosition - 1]

        // Check if we're on a literal character
        if (
          patternChar &&
          patternChar !== '#' &&
          patternChar !== 'A' &&
          patternChar !== '*'
        ) {
          // Skip over literal characters when backspacing
          e.preventDefault()
          const newValue =
            target.value.substring(0, cursorPosition - 1) +
            target.value.substring(cursorPosition)
          target.value = newValue
          target.setSelectionRange(cursorPosition - 1, cursorPosition - 1)
          handleInput(new Event('input'))
        }
      }
    }
  }

  $effect(() => {
    if (!inputEl) return

    // Set initial value if provided
    if (value != null) {
      const formatted = formatValue(value)
      inputEl.value = formatted
    }
  })

  // Watch for external value changes
  $effect(() => {
    if (!inputEl || !value) return

    // Only update if not currently focused
    if (document.activeElement !== inputEl) {
      const formatted = formatValue(value)
      inputEl.value = formatted
    }
  })
</script>

<input
  bind:this={inputEl}
  oninput={handleInput}
  onchange={handleChange}
  onkeydown={handleKeyDown}
  placeholder={placeholder ||
    pattern
      .replace(/#/g, maskChar)
      .replace(/A/g, maskChar)
      .replace(/\*/g, maskChar)}
  {...restProps}
/>

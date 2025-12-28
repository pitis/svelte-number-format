<script lang="ts">
  import {
    InputValidators,
    type InputValidatorsKeys
  } from './inputValidations.js'

  type WithValidation =
    | {
        reportAs: 'css-class'
        className: {
          valid: string
          invalid: string
        }
        applyOn: 'input' | 'change' | 'both'
        validate: ((value: string) => boolean) | InputValidatorsKeys
      }
    | {
        reportAs: 'data-attribute'
        attributeName: string
        applyOn: 'input' | 'change' | 'both'
        validate: ((value: string) => boolean) | InputValidatorsKeys
      }
    | {
        reportAs: 'callback'
        applyOn: 'input' | 'change' | 'both'
        validate: ((value: string) => boolean) | InputValidatorsKeys
        onValidation: (isValid: boolean) => void
      }

  interface Props {
    value?: string | null
    format?: string
    mask?: string // deprecated, use format
    maskChar?: string
    placeholder?: string
    withValidation?: WithValidation
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
    withValidation,
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

  function calculateCursorPosition(
    oldCursorPos: number,
    oldValue: string,
    newValue: string,
    pattern: string
  ): number {
    // Count how many raw characters were before the cursor
    // We need to map the cursor position in the old (possibly formatted) value
    // to how many raw characters that represents
    let rawCharsBeforeCursor = 0
    let oldPos = 0
    let patternPos = 0

    while (
      oldPos < oldCursorPos &&
      oldPos < oldValue.length &&
      patternPos < pattern.length
    ) {
      const patternChar = pattern[patternPos]
      const oldChar = oldValue[oldPos]

      if (patternChar === '#' || patternChar === 'A' || patternChar === '*') {
        // This is a pattern position
        if (isValidChar(oldChar, patternChar)) {
          rawCharsBeforeCursor++
          oldPos++
          patternPos++
        } else {
          // Character doesn't match pattern, skip it
          oldPos++
        }
      } else {
        // Literal character
        if (oldChar === patternChar) {
          // Matches literal, skip it
          oldPos++
          patternPos++
        } else {
          // User typed a raw char where literal should be, count it
          rawCharsBeforeCursor++
          oldPos++
        }
      }
    }

    // Count any remaining characters beyond the pattern
    while (oldPos < oldCursorPos && oldPos < oldValue.length) {
      rawCharsBeforeCursor++
      oldPos++
    }

    // Now find where those raw characters end up in the new formatted value
    let newCursorPos = 0
    let rawCharsCounted = 0
    patternPos = 0

    while (
      patternPos < pattern.length &&
      rawCharsCounted < rawCharsBeforeCursor &&
      newCursorPos < newValue.length
    ) {
      const patternChar = pattern[patternPos]
      const newChar = newValue[newCursorPos]

      if (patternChar === '#' || patternChar === 'A' || patternChar === '*') {
        if (isValidChar(newChar, patternChar)) {
          rawCharsCounted++
          newCursorPos++
          patternPos++
        } else {
          // Shouldn't happen in formatted string, but advance
          newCursorPos++
          patternPos++
        }
      } else {
        // Literal - always include it
        newCursorPos++
        patternPos++
      }
    }

    // If we still need more positions (beyond pattern)
    while (
      rawCharsCounted < rawCharsBeforeCursor &&
      newCursorPos < newValue.length
    ) {
      newCursorPos++
      rawCharsCounted++
    }

    return Math.min(newCursorPos, newValue.length)
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

    // Calculate new cursor position based on raw characters typed
    const newCursorPos = calculateCursorPosition(
      cursorPosition,
      inputValue,
      formatted,
      pattern
    )

    // Restore cursor position
    target.setSelectionRange(newCursorPos, newCursorPos)

    // Update bound value with raw value
    value = result.raw || null

    // Call callback
    onInput?.(result.raw || null, formatted || null)
    if (withValidation !== undefined) {
      if (withValidation.applyOn !== 'change') {
        let validationResult = null

        if (typeof withValidation.validate === 'function') {
          validationResult = withValidation.validate(result.raw)
        } else {
          validationResult = handleValidation(
            result.raw,
            withValidation.validate
          )
        }

        handleValidationReporting(validationResult, target)
      }
    }
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement
    const result = applyMask(target.value, pattern)

    value = result.raw || null
    target.value = result.masked

    onChange?.(result.raw || null, result.masked || null)

    if (withValidation !== undefined) {
      if (withValidation.applyOn !== 'input') {
        let validationResult = null

        if (typeof withValidation.validate === 'function') {
          validationResult = withValidation.validate(result.raw)
        } else {
          validationResult = handleValidation(
            result.raw,
            withValidation.validate
          )
        }

        handleValidationReporting(validationResult, target)
      }
    }
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

  function handleValidation(value: string, validator: InputValidatorsKeys) {
    let validate = InputValidators[validator]

    if (!validate) {
      console.warn(`No validator found for key: ${validator}`)

      validate = () => true
    }

    return validate(value)
  }

  function handleValidationReporting(
    result: boolean,
    inputEl: HTMLInputElement
  ) {
    if (!withValidation) return

    switch (withValidation.reportAs) {
      case 'css-class':
        if (result) {
          inputEl.classList.remove(withValidation.className.invalid)
          inputEl.classList.add(withValidation.className.valid)
        } else {
          inputEl.classList.remove(withValidation.className.valid)
          inputEl.classList.add(withValidation.className.invalid)
        }
        break
      case 'data-attribute':
        inputEl.setAttribute(
          withValidation.attributeName,
          result ? 'true' : 'false'
        )
        break
      case 'callback':
        withValidation.onValidation(result)
        break
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

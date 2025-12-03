<script lang="ts">
  import { NumberInput } from 'intl-number-input'
  import type { NumberInputOptions, NumberInputValue } from 'intl-number-input'

  type ValueType = number | string | null

  interface Props {
    value?: ValueType
    // Number formatting props
    locale?: string
    options?: Partial<NumberInputOptions>
    // Mask formatting props
    format?: string
    mask?: string
    maskChar?: string
    // Callbacks (support both number and string)
    onInput?: (value: any, formatted: string | null) => void
    onChange?: (value: any, formatted: string | null) => void
    [key: string]: any
  }

  let {
    value = $bindable(null),
    locale = navigator.language,
    options = {},
    format = undefined,
    mask = undefined,
    maskChar = '_',
    onInput = () => {},
    onChange = () => {},
    ...restProps
  }: Props = $props()

  let inputEl: HTMLInputElement | null = null
  let numberInput: NumberInput | null = null
  let isFocused = false
  let cursorPosition = 0

  // Determine which mode we're in
  const maskPattern = $derived(format || mask)
  const isMaskMode = $derived(!!maskPattern)

  // Mask utility functions
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

  function applyMask(inputValue: string, maskPattern: string): { masked: string; raw: string } {
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

  // Mask mode handlers
  function handleMaskInput(e: Event) {
    const target = e.target as HTMLInputElement
    const inputValue = target.value
    
    cursorPosition = target.selectionStart || 0
    
    const result = applyMask(inputValue, maskPattern!)
    const formatted = result.masked
    
    target.value = formatted
    
    let newCursorPos = cursorPosition
    if (formatted.length > inputValue.length) {
      newCursorPos = Math.min(cursorPosition + 1, formatted.length)
    }
    
    target.setSelectionRange(newCursorPos, newCursorPos)
    
    value = result.raw || null
    onInput?.(result.raw || null, formatted || null)
  }

  function handleMaskChange(e: Event) {
    const target = e.target as HTMLInputElement
    const result = applyMask(target.value, maskPattern!)
    
    value = result.raw || null
    target.value = result.masked
    
    onChange?.(result.raw || null, result.masked || null)
  }

  function handleMaskKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement
    
    if (e.key === 'Backspace') {
      cursorPosition = target.selectionStart || 0
      
      if (cursorPosition > 0 && maskPattern) {
        const maskPatternChar = maskPattern[cursorPosition - 1]
        
        if (maskPatternChar && maskPatternChar !== '#' && maskPatternChar !== 'A' && maskPatternChar !== '*') {
          e.preventDefault()
          const newValue = target.value.substring(0, cursorPosition - 1) + target.value.substring(cursorPosition)
          target.value = newValue
          target.setSelectionRange(cursorPosition - 1, cursorPosition - 1)
          handleMaskInput(new Event('input'))
        }
      }
    }
  }

  // Number formatting mode
  $effect(() => {
    if (!inputEl || isMaskMode) return

    numberInput?.destroy?.()

    numberInput = new NumberInput({
      el: inputEl,
      options: {
        locale,
        ...options
      },
      onInput: (val: NumberInputValue) => {
        onInput?.(val.number ?? null, val.formatted ?? null)
      },
      onChange: (val: NumberInputValue) => {
        value = val.number ?? null
        onChange?.(val.number ?? null, val.formatted ?? null)
      }
    })

    if (typeof value === 'number' && value != null) {
      numberInput.setValue(value)
    } else if (value == null) {
      // Clear the input
    }

    const handleFocus = () => {
      isFocused = true
    }
    const handleBlur = () => {
      isFocused = false
      try {
        const cur = (numberInput as any).getValue?.() as
          | NumberInputValue
          | undefined
        if (cur) {
          value = cur.number ?? null
        } else {
          const parsed = inputEl?.value
            ? Number(inputEl.value.replace(/\s/g, ''))
            : null
          value = Number.isFinite(parsed) ? parsed : null
        }
      } catch (ex) {
        console.error(ex)
      }
    }

    inputEl.addEventListener('focus', handleFocus)
    inputEl.addEventListener('blur', handleBlur)

    return () => {
      inputEl?.removeEventListener('focus', handleFocus)
      inputEl?.removeEventListener('blur', handleBlur)
      numberInput?.destroy?.()
      numberInput = null
    }
  })

  $effect(() => {
    if (!numberInput || isMaskMode) return
    if (isFocused) return

    if (typeof value === 'number') {
      numberInput.setValue(value ?? null)
    }
  })

  // Mask mode initialization
  $effect(() => {
    if (!inputEl || !isMaskMode) return
    
    if (value != null && typeof value === 'string') {
      const result = applyMask(value, maskPattern!)
      inputEl.value = result.masked
    }
  })

  // Watch for external value changes in mask mode
  $effect(() => {
    if (!inputEl || !isMaskMode || !value) return
    
    if (document.activeElement !== inputEl && typeof value === 'string') {
      const result = applyMask(value, maskPattern!)
      inputEl.value = result.masked
    }
  })

  // Generate placeholder for mask mode
  const maskPlaceholder = $derived(() => {
    if (!isMaskMode || !maskPattern || restProps.placeholder) return restProps.placeholder
    return maskPattern.replace(/#/g, maskChar).replace(/A/g, maskChar).replace(/\*/g, maskChar)
  })
</script>

{#if isMaskMode}
  <input
    bind:this={inputEl}
    oninput={handleMaskInput}
    onchange={handleMaskChange}
    onkeydown={handleMaskKeyDown}
    placeholder={maskPlaceholder()}
    {...restProps}
  />
{:else}
  <input bind:this={inputEl} {...restProps} />
{/if}

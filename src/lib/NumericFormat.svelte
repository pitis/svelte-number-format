<script lang="ts">
  import { NumberInput } from 'intl-number-input'
  import type { NumberInputOptions, NumberInputValue } from 'intl-number-input'

  interface Props {
    value?: number | null
    locale?: string
    options?: Partial<NumberInputOptions>
    onInput?: (raw: number | null, formatted: string | null) => void
    onChange?: (raw: number | null, formatted: string | null) => void
    [key: string]: unknown
  }

  let {
    value = $bindable(null),
    locale = navigator.language,
    options = {},
    onInput = () => {},
    onChange = () => {},
    ...restProps
  }: Props = $props()

  let inputEl: HTMLInputElement | null = null
  let numberInput: NumberInput | null = null
  let isFocused = false

  $effect(() => {
    if (!inputEl) return

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
        // update external numeric value here
        value = val.number ?? null
        onChange?.(val.number ?? null, val.formatted ?? null)
      }
    })

    if (value != null) {
      numberInput.setValue(value)
    }

    const handleFocus = () => {
      isFocused = true
    }
    const handleBlur = () => {
      isFocused = false
      try {
        const cur = numberInput?.getValue?.() as NumberInputValue | undefined
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
    if (!numberInput) return
    if (isFocused) return

    numberInput.setValue(value ?? null)
  })
</script>

<input bind:this={inputEl} {...restProps} />

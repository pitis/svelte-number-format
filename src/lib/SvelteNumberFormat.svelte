<script lang="ts">
  import { NumberInput } from 'intl-number-input'
  import type { NumberInputOptions, NumberInputValue } from 'intl-number-input'

  interface Props {
    value?: number | null
    locale?: string
    options?: Partial<NumberInputOptions>
    onInput?: (raw: number | null, formatted: string | null) => void
    onChange?: (raw: number | null, formatted: string | null) => void
    [key: string]: any
  }

  let {
    value = $bindable(null),
    locale = navigator.language ?? 'en-US',
    options = {},
    onInput = () => {},
    onChange = () => {},
    ...restProps
  }: Props = $props()

  let inputEl: HTMLInputElement | null = null
  let numberInput: NumberInput | null = null

  let inputString: string | null = null
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
        inputString = val.formatted ?? null

        onInput?.(val.number ?? null, val.formatted ?? null)
      },
      onChange: (val: NumberInputValue) => {
        inputString = val.formatted ?? null

        // update external numeric value here
        value = val.number ?? null
        onChange?.(val.number ?? null, val.formatted ?? null)
      }
    })

    if (value != null) {
      numberInput.setValue(value)
      inputString = numberInput.getValue?.()?.formatted ?? String(value)
    } else {
      inputString = null
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
          inputString = cur.formatted ?? null
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

    try {
      const cur = (numberInput as any).getValue?.() as
        | NumberInputValue
        | undefined
      inputString = cur?.formatted ?? (value != null ? String(value) : null)
    } catch {
      inputString = value != null ? String(value) : null
    }
  })
</script>

<input bind:this={inputEl} {...restProps} />

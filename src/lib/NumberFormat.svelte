<script lang="ts">
  import { NumberInput } from 'intl-number-input'
  import type { NumberInputOptions, NumberInputValue } from 'intl-number-input'

  interface Props {
    value?: number | null
    locale?: string
    options?: Partial<NumberInputOptions>
    onInput?: (raw: number | null, formatted: string | null) => void
    onChange?: (raw: number | null, formatted: string | null) => void
    // Pass through any HTML input attributes
    [key: string]: any
  }

  let {
    value = $bindable(null),
    locale = navigator.language,
    options = {},
    onInput = () => {},
    onChange,
    ...restProps
  }: Props = $props()

  let inputEl: HTMLInputElement | null = $state(null)
  let controller: NumberInput | null = $state(null)
  let internalValue = $state<number | null>(null)

  // Initialize and reinitialize the controller when input, locale, or options change
  $effect(() => {
    if (!inputEl) return

    // Destroy previous controller if it exists
    controller?.destroy?.()

    const c = new NumberInput({
      el: inputEl,
      options: {
        locale,
        ...options
      },
      onInput: (val: NumberInputValue) => {
        internalValue = val.number
        value = val.number
        onInput(val.number, val.formatted)
      },
      onChange: onChange
        ? (val: NumberInputValue) => {
            onChange(val.number, val.formatted)
          }
        : undefined
    })

    controller = c

    // Use queueMicrotask to ensure controller is fully initialized
    queueMicrotask(() => {
      if (value !== null && value !== undefined) {
        c.setValue(value)
        internalValue = value
      }
    })

    return () => {
      c.destroy()
    }
  })

  // Sync external value changes to the controller
  $effect(() => {
    if (controller && value !== internalValue) {
      controller.setValue(value)
      internalValue = value
    }
  })
</script>

<input bind:this={inputEl} {...restProps} />

<script lang="ts">
  import { applyMask, type CustomPatterns } from './internal/cursor.js'

  interface Props {
    value?: string | number | null
    format?: string
    fallback?: string
    customPatterns?: CustomPatterns
    [key: string]: unknown
  }

  let {
    value = null,
    format = '',
    fallback = '',
    customPatterns,
    ...restProps
  }: Props = $props()

  const pattern = $derived(format)
  const stringValue = $derived(value == null ? '' : String(value))
  const formatted = $derived(
    pattern && stringValue
      ? applyMask(stringValue, pattern, customPatterns).masked
      : stringValue
  )
  const displayText = $derived(formatted || fallback)
</script>

<span {...restProps}>{displayText}</span>

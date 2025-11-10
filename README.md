# svelte-number-format

**Svelte Number Format** is a lightweight and reactive number input component for [Svelte 5](https://svelte.dev).  
It’s built on top of [intl-number-input](https://www.npmjs.com/package/intl-number-input), bringing locale-aware formatting, currency, percent, and advanced numeric input control — with full caret stability and two-way binding.

## Usage

Install with npm or yarn:

```bash
npm install --save svelte-number-format
```

## Props

| **Prop**            | **Type**                                   | **Description**                                                       |
| ------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `value`             | `string \| number`                         | Initial value to display.                                             |
| `format`            | `string`                                   | Custom number format (e.g., `#,###.##`).                              |
| `mask`              | `string`                                   | Input mask (e.g., `"(###) ###-####"`).                                |
| `decimalSeparator`  | `string`                                   | Character for the decimal separator (default: `.`).                   |
| `thousandSeparator` | `string`                                   | Character for the thousand separator (default: `,`).                  |
| `onInput`           | `(formatted: string, raw: string) => void` | Callback function invoked with the formatted and raw values on input. |

## Example

```js
<script lang="ts">
	import SvelteNumberFormat from 'svelte-number-format'
	import { NumberFormatStyle } from 'intl-number-input'

	let amount = $state<number | null>(1234.56)
</script>

<SvelteNumberFormat
	bind:value={amount}
	locale="en-US"
	options={{
		formatStyle: NumberFormatStyle.Currency,
		currency: 'USD',
		precision: 2
	}}
	placeholder="$0.00"
	class="input"
/>

<p>Value: {amount}</p>

```

## License

MIT &copy; [Pitis Radu](https://github.com/pitis)

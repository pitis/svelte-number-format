# svelte-number-format

**Svelte Number Format** is a lightweight and reactive number input component for [Svelte 5](https://svelte.dev).  
It’s built on top of [intl-number-input](https://www.npmjs.com/package/intl-number-input), bringing locale-aware formatting, currency, percent, and advanced numeric input control — with full caret stability and two-way binding.

## Live Demo

Check out a working demo here: [https://pitis.github.io/svelte-number-format/](https://pitis.github.io/svelte-number-format/)

## Installation

Install with npm or yarn:

```bash
npm install svelte-number-format
```

## Props

| Prop                          | Type                                                       | Description                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `value`                       | `number \| null`                                           | The numeric value of the input. Can be bound using `bind:value`.                                                                |
| `locale`                      | `string`                                                   | Locale string for formatting (default: `navigator.language`).                                                                   |
| `options`                     | `Partial<NumberInputOptions>`                              | Options passed to `intl-number-input`. Includes `precision`, `formatStyle`, `currency`, `valueRange`, `autoDecimalDigits`, etc. |
| `onInput`                     | `(raw: number \| null, formatted: string \| null) => void` | Callback triggered on every keystroke.                                                                                          |
| `onChange`                    | `(raw: number \| null, formatted: string \| null) => void` | Callback triggered on blur or when the input value changes.                                                                     |
| `[key: string]` / `restProps` | `any`                                                      | Any additional HTML `<input>` attributes (e.g., `placeholder`, `class`, `id`).                                                  |

## Usage

```js
<script lang="ts">
	import { SvelteNumberFormat, NumberFormatStyle } from 'svelte-number-format';

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

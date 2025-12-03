# svelte-number-format

**Svelte Number Format** is a lightweight and reactive input component library for [Svelte 5](https://svelte.dev).  
Inspired by [react-number-format](https://www.npmjs.com/package/react-number-format), it provides two powerful components for handling formatted inputs with full caret stability and two-way binding.

## Features

✨ **Two Specialized Components**

- **NumericFormat** - Locale-aware number formatting (currency, percentages, decimals)
- **PatternFormat** - Pattern-based input masking (phone, credit cards, dates, custom)

🎯 **Developer Experience**

- Full TypeScript support
- Two-way binding with `bind:value`
- Svelte 5 native (using runes)
- Caret position stability
- Callback hooks for input/change events

🌍 **Internationalization**

- Built on `Intl.NumberFormat` API
- Support for any locale
- Automatic formatting based on locale

## Live Demo

Check out the working demo: [https://pitis.github.io/svelte-number-format/](https://pitis.github.io/svelte-number-format/)

## Installation

```bash
npm install svelte-number-format
```

## Quick Start

### Currency Input

```svelte
<script lang="ts">
  import { NumericFormat, NumberFormatStyle } from 'svelte-number-format'

  let amount = $state<number | null>(1234.56)
</script>

<NumericFormat
  bind:value={amount}
  locale="en-US"
  options={{
    formatStyle: NumberFormatStyle.Currency,
    currency: 'USD',
    precision: 2
  }}
  placeholder="$0.00"
/>
```

### Phone Number Input

```svelte
<script lang="ts">
  import { PatternFormat, MaskPatterns } from 'svelte-number-format'

  let phone = $state<string | null>(null)
</script>

<PatternFormat
  bind:value={phone}
  format={MaskPatterns.PHONE_US}
  placeholder="(123) 456-7890"
/>
```

---

## NumericFormat Component

Locale-aware number formatting built on [intl-number-input](https://www.npmjs.com/package/intl-number-input).

### Props

| Prop       | Type                                                       | Default              | Description                                                          |
| ---------- | ---------------------------------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `value`    | `number \| null`                                           | `null`               | The numeric value. Use `bind:value` for two-way binding.             |
| `locale`   | `string`                                                   | `navigator.language` | Locale string for formatting (e.g., `'en-US'`, `'de-DE'`, `'ja-JP'`) |
| `options`  | `Partial<NumberInputOptions>`                              | `{}`                 | Formatting options (see below)                                       |
| `onInput`  | `(raw: number \| null, formatted: string \| null) => void` | `undefined`          | Callback fired on every keystroke                                    |
| `onChange` | `(raw: number \| null, formatted: string \| null) => void` | `undefined`          | Callback fired on blur/change                                        |
| `...rest`  | `any`                                                      | -                    | All other HTML input attributes (`placeholder`, `class`, `id`, etc.) |

### Options

The `options` prop accepts these properties:

| Option              | Type                             | Description                                                                   |
| ------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| `formatStyle`       | `NumberFormatStyle`              | `Decimal`, `Currency`, or `Percent`                                           |
| `currency`          | `string`                         | Currency code (e.g., `'USD'`, `'EUR'`, `'GBP'`) - required for Currency style |
| `precision`         | `number`                         | Number of decimal places                                                      |
| `valueRange`        | `{ min?: number, max?: number }` | Min/max value constraints                                                     |
| `autoDecimalDigits` | `boolean`                        | Automatically position decimal (e.g., typing `1234` → `12.34`)                |

### NumberFormatStyle Enum

```typescript
import { NumberFormatStyle } from 'svelte-number-format'

NumberFormatStyle.Decimal // Plain number with locale formatting
NumberFormatStyle.Currency // Currency with symbol ($, €, £, etc.)
NumberFormatStyle.Percent // Percentage (0.75 → 75%)
```

### Examples

#### Basic Number Input

```svelte
<script lang="ts">
  import { NumericFormat } from 'svelte-number-format'
  let value = $state<number | null>(1234.56)
</script>

<NumericFormat
  bind:value
  options={{ precision: 2 }}
  placeholder="Enter amount"
/>
<!-- User sees: 1,234.56 -->
```

#### Currency (USD)

```svelte
<script lang="ts">
  import { NumericFormat, NumberFormatStyle } from 'svelte-number-format'
  let price = $state<number | null>(99.99)
</script>

<NumericFormat
  bind:value={price}
  locale="en-US"
  options={{
    formatStyle: NumberFormatStyle.Currency,
    currency: 'USD',
    precision: 2
  }}
/>
<!-- User sees: $99.99 -->
```

#### Currency (EUR with German locale)

```svelte
<NumericFormat
  bind:value={amount}
  locale="de-DE"
  options={{
    formatStyle: NumberFormatStyle.Currency,
    currency: 'EUR',
    precision: 2
  }}
/>
<!-- User sees: 1.234,56 € -->
```

#### Percentage

```svelte
<script lang="ts">
  import { NumericFormat, NumberFormatStyle } from 'svelte-number-format'
  let rate = $state<number | null>(0.75) // Store as decimal
</script>

<NumericFormat
  bind:value={rate}
  options={{
    formatStyle: NumberFormatStyle.Percent,
    precision: 2
  }}
/>
<!-- User sees: 75.00% -->
<!-- Value stored as: 0.75 -->
```

#### With Value Range

```svelte
<NumericFormat
  bind:value={amount}
  options={{
    precision: 2,
    valueRange: { min: 0, max: 1000 }
  }}
  placeholder="0 - 1000"
/>
<!-- Values are clamped to 0-1000 on blur -->
```

#### Auto Decimal Mode

```svelte
<NumericFormat
  bind:value={price}
  options={{
    precision: 2,
    autoDecimalDigits: true
  }}
  placeholder="Type 1234 → 12.34"
/>
<!-- Typing "1234" automatically formats as "12.34" -->
```

#### With Callbacks

```svelte
<script lang="ts">
  import { NumericFormat } from 'svelte-number-format'

  let value = $state<number | null>(null)

  function handleInput(raw: number | null, formatted: string | null) {
    console.log('Input:', raw, formatted)
  }

  function handleChange(raw: number | null, formatted: string | null) {
    console.log('Change:', raw, formatted)
  }
</script>

<NumericFormat
  bind:value
  options={{ precision: 2 }}
  onInput={handleInput}
  onChange={handleChange}
/>
```

---

## PatternFormat Component

Pattern-based input masking for structured text inputs.

### Props

| Prop          | Type                                                       | Default     | Description                                                              |
| ------------- | ---------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `value`       | `string \| null`                                           | `null`      | The raw unmasked value. Use `bind:value` for two-way binding.            |
| `format`      | `string`                                                   | `''`        | Pattern string (e.g., `'(###) ###-####'`). See pattern characters below. |
| `mask`        | `string`                                                   | `''`        | **Deprecated** - Use `format` instead. Kept for backwards compatibility. |
| `maskChar`    | `string`                                                   | `'_'`       | Character shown in placeholder for pattern positions                     |
| `placeholder` | `string`                                                   | auto        | Placeholder text (auto-generated from format if not provided)            |
| `onInput`     | `(raw: string \| null, formatted: string \| null) => void` | `undefined` | Callback fired on every keystroke                                        |
| `onChange`    | `(raw: string \| null, formatted: string \| null) => void` | `undefined` | Callback fired on blur/change                                            |
| `...rest`     | `any`                                                      | -           | All other HTML input attributes                                          |

### Pattern Characters

| Character | Accepts                  | Example                       |
| --------- | ------------------------ | ----------------------------- |
| `#`       | Digit (0-9)              | `###` → `123`                 |
| `A`       | Letter (a-zA-Z)          | `AAA` → `ABC`                 |
| `*`       | Alphanumeric (a-zA-Z0-9) | `***` → `A1B`                 |
| Other     | Literal                  | `-`, `(`, `)`, `/`, `:`, etc. |

### Predefined Patterns

Import ready-to-use patterns:

```typescript
import { MaskPatterns } from 'svelte-number-format'
```

#### Phone Numbers

```typescript
MaskPatterns.PHONE_US // (###) ###-####
MaskPatterns.PHONE_US_WITH_EXT // (###) ###-#### ext. #####
MaskPatterns.PHONE_INTERNATIONAL // +## (###) ###-####
```

#### Credit Cards

```typescript
MaskPatterns.CREDIT_CARD // #### #### #### ####
MaskPatterns.CREDIT_CARD_AMEX // #### ###### #####
```

#### Dates & Time

```typescript
MaskPatterns.DATE_US // ##/##/####
MaskPatterns.DATE_ISO // ####-##-##
MaskPatterns.DATE_EU // ##.##.####
MaskPatterns.TIME_12H // ##:## AM
MaskPatterns.TIME_24H // ##:##
MaskPatterns.DATETIME_US // ##/##/#### ##:##
```

#### Identification

```typescript
MaskPatterns.SSN // ###-##-####
MaskPatterns.ZIP_US // #####
MaskPatterns.ZIP_US_PLUS4 // #####-####
```

#### Other

```typescript
MaskPatterns.IPV4 // ###.###.###.###
MaskPatterns.MAC_ADDRESS // ##:##:##:##:##:##
MaskPatterns.HEX_COLOR // #******
```

### Examples

#### Phone Number

```svelte
<script lang="ts">
  import { PatternFormat, MaskPatterns } from 'svelte-number-format'
  let phone = $state<string | null>(null)
</script>

<PatternFormat bind:value={phone} format={MaskPatterns.PHONE_US} />
<!-- User types: 1234567890 -->
<!-- Display: (123) 456-7890 -->
<!-- Value stored: "1234567890" -->
```

#### Credit Card

```svelte
<script lang="ts">
  import { PatternFormat, MaskPatterns } from 'svelte-number-format'
  let card = $state<string | null>(null)
</script>

<PatternFormat
  bind:value={card}
  format={MaskPatterns.CREDIT_CARD}
  placeholder="1234 5678 9012 3456"
/>
<!-- User types: 1234567890123456 -->
<!-- Display: 1234 5678 9012 3456 -->
<!-- Value stored: "1234567890123456" -->
```

#### Date

```svelte
<PatternFormat
  bind:value={date}
  format={MaskPatterns.DATE_US}
  placeholder="MM/DD/YYYY"
/>
<!-- User types: 12252024 -->
<!-- Display: 12/25/2024 -->
<!-- Value stored: "12252024" -->
```

#### Social Security Number

```svelte
<PatternFormat bind:value={ssn} format={MaskPatterns.SSN} />
<!-- Display: 123-45-6789 -->
<!-- Value stored: "123456789" -->
```

#### Custom Pattern

```svelte
<PatternFormat
  bind:value={code}
  format="AAA-###-***"
  placeholder="ABC-123-XYZ"
/>
<!-- Accepts: [Letter][Letter][Letter]-[Digit][Digit][Digit]-[Any][Any][Any] -->
<!-- Example: ABC-123-X5Z -->
<!-- Value stored: "ABC123X5Z" -->
```

#### License Plate (Custom)

```svelte
<PatternFormat bind:value={plate} format="AAA ####" placeholder="ABC 1234" />
```

#### Product Code (Custom)

```svelte
<PatternFormat bind:value={product} format="***-***-***" />
<!-- Accepts any combination of letters and numbers -->
```

---

## Advanced Usage

### Controlled Components

Both components support controlled mode:

```svelte
<script lang="ts">
  import { NumericFormat } from 'svelte-number-format'
  let amount = $state<number | null>(100)
</script>

<NumericFormat bind:value={amount} options={{ precision: 2 }} />

<button onclick={() => (amount = 100)}>$100</button>
<button onclick={() => (amount = 1000)}>$1,000</button>
<button onclick={() => (amount = null)}>Clear</button>
```

### Form Integration

```svelte
<script lang="ts">
  let formData = $state({
    price: null as number | null,
    phone: null as string | null
  })

  function handleSubmit() {
    console.log('Form data:', formData)
  }
</script>

<form onsubmit={handleSubmit}>
  <NumericFormat
    bind:value={formData.price}
    options={{ formatStyle: NumberFormatStyle.Currency, currency: 'USD' }}
  />

  <PatternFormat bind:value={formData.phone} format={MaskPatterns.PHONE_US} />

  <button type="submit">Submit</button>
</form>
```

### Custom Styling

```svelte
<NumericFormat
  bind:value={amount}
  class="my-custom-input"
  style="border: 2px solid blue;"
/>

<style>
  :global(.my-custom-input) {
    padding: 1rem;
    font-size: 1.5rem;
    border-radius: 8px;
  }
</style>
```

---

## Migration from v1.x

If you're upgrading from an earlier version, see [MIGRATION.md](./MIGRATION.md) for the full migration guide.

### Quick Migration

**Old names** (still work):

```svelte
import {(SvelteNumberFormat, SvelteMaskFormat)} from 'svelte-number-format';
```

**New names** (recommended):

```svelte
import {(NumericFormat, PatternFormat)} from 'svelte-number-format';
```

---

## TypeScript

Full TypeScript support with proper type definitions:

```typescript
import type { NumberInputOptions } from 'intl-number-input'
import {
  NumericFormat,
  PatternFormat,
  NumberFormatStyle,
  MaskPatterns
} from 'svelte-number-format'
import type { MaskPattern } from 'svelte-number-format'
```

---

## Browser Support

- Svelte 5+
- Modern browsers with `Intl.NumberFormat` support
- IE11+ with polyfills

---

## Contributing

Contributions are welcome! This project uses:

- **Husky** - Git hooks for quality checks
- **lint-staged** - Run checks on staged files only
- **Pre-commit hooks** - Automatic formatting, linting, and testing

Before each commit, the following runs automatically:

- ✅ Prettier formatting
- ✅ ESLint linting with auto-fix
- ✅ Tests for changed files

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development setup and guidelines.

---

## License

MIT © [Pitis Radu](https://github.com/pitis)

---

## Acknowledgments

- Inspired by [react-number-format](https://www.npmjs.com/package/react-number-format)
- Built on [intl-number-input](https://www.npmjs.com/package/intl-number-input)

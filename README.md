# svelte-number-format

[![CI](https://github.com/pitis/svelte-number-format/actions/workflows/ci.yml/badge.svg)](https://github.com/pitis/svelte-number-format/actions/workflows/ci.yml)
[![Deploy](https://github.com/pitis/svelte-number-format/actions/workflows/deploy.yml/badge.svg)](https://github.com/pitis/svelte-number-format/actions/workflows/deploy.yml)
[![npm version](https://badge.fury.io/js/svelte-number-format.svg)](https://www.npmjs.com/package/svelte-number-format)

**svelte-number-format** is a lightweight, reactive input-formatting library for [Svelte 5](https://svelte.dev): currency inputs, percentages, plain numbers, and pattern-based input masks (phone, credit card, dates) with caret-stable editing, two-way binding and `Intl.NumberFormat` localization.  
Inspired by [react-number-format](https://www.npmjs.com/package/react-number-format), with a compatible `onValueChange` API.

## Features

✨ **Four Components**

- **NumericFormat** — locale-aware number input (currency, percentages, decimals)
- **PatternFormat** — pattern-based input masking (phone, credit cards, dates, custom)
- **NumericText** — display-only rendering of formatted numbers (no input)
- **PatternText** — display-only rendering of masked strings (no input)

🎯 **Developer experience**

- Full TypeScript support
- Two-way binding with `bind:value`
- Svelte 5 native (runes only)
- Caret position stability across formatting
- Paste handling that re-formats the whole clipboard buffer in one shot
- IME (composition) aware masking — `PatternFormat` doesn't break CJK input
- Rich `onValueChange` callback with `{ floatValue, formattedValue, value }` (react-number-format compatible)
- Custom pattern tokens via `customPatterns`
- `allowEmptyFormatting` to show the mask skeleton before typing
- SSR-safe (no `navigator` at module eval)
- A11y-ready — forwards `aria-*` attributes, auto-sets `aria-placeholder` and `inputmode`
- Small — `PatternFormat` is 3.9 kB gzipped with zero runtime dependencies; `NumericFormat` is ~7.6 kB gzipped including its only dependency, [intl-number-input](https://www.npmjs.com/package/intl-number-input)

🌍 **Internationalization**

- Built on `Intl.NumberFormat`
- Any BCP-47 locale
- Automatic thousands / decimal / currency symbol per locale

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

| Prop            | Type                                                       | Default         | Description                                                                                                                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `number \| string \| null`                                 | `null`          | The numeric value. Use `bind:value` for two-way binding.                                                                                                                                                                                                                           |
| `valueType`     | `'number' \| 'string'`                                     | `'number'`      | Whether the bound `value` is emitted as a `number` or a decimal `string`.                                                                                                                                                                                                          |
| `name`          | `string`                                                   | `undefined`     | When set, a companion `<input type="hidden">` with this name carries the **raw** numeric value (e.g. `1234.56`) for native form submission; the visible formatted input stays unnamed. See [Native forms & SvelteKit remote functions](#native-forms--sveltekit-remote-functions). |
| `form`          | `string`                                                   | `undefined`     | Form `id` for out-of-form association. Applied to both the visible and hidden inputs.                                                                                                                                                                                              |
| `disabled`      | `boolean`                                                  | `undefined`     | Disables the input. Mirrored onto the hidden input so disabled fields are excluded from submission.                                                                                                                                                                                |
| `locale`        | `string \| undefined`                                      | resolved lazily | Locale string. Defaults to `navigator.language` on the client, `'en-US'` during SSR.                                                                                                                                                                                               |
| `options`       | `Partial<NumberInputOptions>`                              | `{}`            | Formatting options (see below).                                                                                                                                                                                                                                                    |
| `onInput`       | `(raw: number \| null, formatted: string \| null) => void` | `undefined`     | Callback fired on every keystroke.                                                                                                                                                                                                                                                 |
| `onChange`      | `(raw: number \| null, formatted: string \| null) => void` | `undefined`     | Callback fired on blur/change.                                                                                                                                                                                                                                                     |
| `onValueChange` | `(values: NumberFormatValues, source: SourceInfo) => void` | `undefined`     | Rich payload callback. See [`onValueChange`](#onvaluechange-rich-payload).                                                                                                                                                                                                         |
| `...rest`       | `any`                                                      | —               | All other HTML input attributes.                                                                                                                                                                                                                                                   |

### Options

The `options` prop accepts these properties:

| Option              | Type                                       | Description                                                                   |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `formatStyle`       | `NumberFormatStyle`                        | `Decimal`, `Currency`, `Percent`, or `Unit`                                   |
| `currency`          | `string`                                   | Currency code (e.g., `'USD'`, `'EUR'`, `'GBP'`) - required for Currency style |
| `precision`         | `number \| { min?: number, max?: number }` | Number of decimal places, fixed or as a range                                 |
| `valueRange`        | `{ min?: number, max?: number }`           | Min/max constraints. Out-of-range values are silently clamped on blur         |
| `autoDecimalDigits` | `boolean`                                  | Automatically position decimal (e.g., typing `1234` → `12.34`)                |

These are the commonly used options. `NumericFormat` passes the whole object through to [intl-number-input](https://www.npmjs.com/package/intl-number-input), so every `NumberInputOptions` field works — `useGrouping`, `exportValueAsInteger`, `currencyDisplay`, `unit`/`unitDisplay`, `autoSign`, `step`, and the on-focus display toggles (`hidePrefixOrSuffixOnFocus`, `hideGroupingSeparatorOnFocus`, `hideNegligibleDecimalDigitsOnFocus`).

### NumberFormatStyle Enum

```typescript
import { NumberFormatStyle } from 'svelte-number-format'

NumberFormatStyle.Decimal // Plain number with locale formatting
NumberFormatStyle.Currency // Currency with symbol ($, €, £, etc.)
NumberFormatStyle.Percent // Percentage (0.75 → 75%)
NumberFormatStyle.Unit // Unit formatting — pair with options.unit (e.g. 'kilometer')
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

| Prop                   | Type                                                       | Default     | Description                                                                                                                                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`                | `string \| null`                                           | `null`      | The raw unmasked value. Use `bind:value` for two-way binding.                                                                                                                                                                                                                             |
| `format`               | `string`                                                   | `''`        | Pattern string (e.g. `'(###) ###-####'`). See [pattern characters](#pattern-characters).                                                                                                                                                                                                  |
| `name`                 | `string`                                                   | `undefined` | When set, a companion `<input type="hidden">` with this name carries the **raw** unmasked value (never the mask skeleton) for native form submission; the visible masked input stays unnamed. See [Native forms & SvelteKit remote functions](#native-forms--sveltekit-remote-functions). |
| `form`                 | `string`                                                   | `undefined` | Form `id` for out-of-form association. Applied to both the visible and hidden inputs.                                                                                                                                                                                                     |
| `disabled`             | `boolean`                                                  | `undefined` | Disables the input. Mirrored onto the hidden input so disabled fields are excluded from submission.                                                                                                                                                                                       |
| `maskChar`             | `string`                                                   | `'_'`       | Character shown in auto-generated placeholder for pattern positions.                                                                                                                                                                                                                      |
| `placeholder`          | `string`                                                   | auto        | Placeholder text. Auto-generated from `format` if not provided.                                                                                                                                                                                                                           |
| `customPatterns`       | `Record<string, RegExp>`                                   | `undefined` | Additional pattern tokens. See [Custom patterns](#custom-patterns).                                                                                                                                                                                                                       |
| `allowEmptyFormatting` | `boolean`                                                  | `false`     | Render the mask skeleton as the input's value when empty. See below.                                                                                                                                                                                                                      |
| `onInput`              | `(raw: string \| null, formatted: string \| null) => void` | `undefined` | Callback fired on every keystroke (not during IME composition).                                                                                                                                                                                                                           |
| `onChange`             | `(raw: string \| null, formatted: string \| null) => void` | `undefined` | Callback fired on blur/change.                                                                                                                                                                                                                                                            |
| `onValueChange`        | `(values: NumberFormatValues, source: SourceInfo) => void` | `undefined` | Rich payload callback. See [`onValueChange`](#onvaluechange-rich-payload).                                                                                                                                                                                                                |
| `...rest`              | `any`                                                      | —           | All other HTML input attributes.                                                                                                                                                                                                                                                          |

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

## Display-only components

`NumericText` and `PatternText` render formatted values as a `<span>` (no input). Useful in tables, summaries, and read-only views where you want to reuse your formatting rules.

```svelte
<script lang="ts">
  import {
    NumericText,
    PatternText,
    MaskPatterns,
    NumberFormatStyle
  } from 'svelte-number-format'
</script>

<!-- Display currency -->
<NumericText
  value={1234.56}
  locale="en-US"
  options={{
    formatStyle: NumberFormatStyle.Currency,
    currency: 'USD',
    precision: 2
  }}
  class="price"
/>
<!-- renders: <span class="price">$1,234.56</span> -->

<!-- Display formatted phone -->
<PatternText value="4155551234" format={MaskPatterns.PHONE_US} />
<!-- renders: <span>(415) 555-1234</span> -->

<!-- Fallback when value is null -->
<NumericText value={null} fallback="—" />
```

Both components accept a `fallback` prop for null/empty values.

---

## `onValueChange` rich payload

For parity with [`react-number-format`](https://www.npmjs.com/package/react-number-format), both inputs accept an `onValueChange` callback with a structured payload:

```typescript
interface NumberFormatValues {
  floatValue: number | undefined // parsed number, or undefined when empty/invalid
  formattedValue: string // what the user sees in the input
  value: string // raw string representation (e.g. "1234.56")
}

interface SourceInfo {
  event: Event | undefined
  source: 'event' | 'prop'
}
```

> **Note:** `source` is currently always `'event'` — `NumericFormat` reports prop-driven updates with a synthetic event, and `PatternFormat` doesn't fire `onValueChange` for external `value` changes. The `'prop'` variant is reserved.

```svelte
<script lang="ts">
  import { NumericFormat, type NumberFormatValues } from 'svelte-number-format'

  let amount = $state<number | null>(null)

  function handleValueChange(values: NumberFormatValues) {
    console.log(values.floatValue) // 1234.56
    console.log(values.formattedValue) // "$1,234.56"
    console.log(values.value) // "1234.56"
  }
</script>

<NumericFormat
  bind:value={amount}
  options={{ precision: 2 }}
  onValueChange={handleValueChange}
/>
```

Pick the field that matches your form-library's expectations — `floatValue` for Zod `z.number()`, `value` for string schemas, `formattedValue` for display.

---

## Paste handling

`PatternFormat` correctly handles paste in one shot, not character-by-character. Pasting any string (including pre-formatted input like `(415) 555-1234` into a phone mask) strips non-matching characters and re-applies the mask atomically, placing the cursor where expected.

No configuration needed — it just works.

---

## Custom patterns

Add your own token characters for patterns that don't fit `#` / `A` / `*`:

```svelte
<script lang="ts">
  import { PatternFormat } from 'svelte-number-format'

  let hexColor = $state<string | null>(null)
</script>

<PatternFormat
  bind:value={hexColor}
  format="HHHHHH"
  customPatterns={{ H: /[0-9a-fA-F]/ }}
  placeholder="ff00aa"
/>

<!-- Binary -->
<PatternFormat format="BBBB BBBB" customPatterns={{ B: /[01]/ }} />
```

Keys that collide with the built-in tokens (`#`, `A`, `*`) trigger a dev-mode warning and the built-in takes precedence.

---

## `allowEmptyFormatting`

Show the mask skeleton in the input even when empty, so users see the expected shape before they start typing:

```svelte
<PatternFormat format={MaskPatterns.PHONE_US} allowEmptyFormatting />
<!-- input.value = "(___) ___-____" even with no value -->
```

On focus, the caret lands at the first fillable slot.

---

## Accessibility

Both input components forward all HTML attributes via spread, so `aria-invalid`, `aria-describedby`, `aria-label`, `aria-errormessage`, and `role` work out of the box. In addition:

- `PatternFormat` sets `aria-placeholder` to the resolved placeholder — your `placeholder` prop if provided, otherwise the auto-generated mask string (e.g. `(___) ___-____`) — so screen readers announce the expected shape.
- `PatternFormat` auto-infers `inputmode` from the pattern (`numeric` / `tel` / `text`) to trigger the right mobile keyboard. Consumer-supplied `inputmode` wins.
- `NumericFormat` gets its `inputmode` from the underlying formatter (`decimal` by default).

```svelte
<PatternFormat
  format={MaskPatterns.PHONE_US}
  aria-label="Phone number"
  aria-invalid={!phone}
  aria-describedby="phone-error"
/>
```

---

## SSR / SvelteKit

Both components render safely in SSR. `NumericFormat`'s default locale is resolved lazily — `navigator.language` on the client, `'en-US'` during server render — so `+page.svelte` using these components won't throw on the server.

```svelte
<!-- +page.svelte (SSR-safe) -->
<script lang="ts">
  import { NumericFormat } from 'svelte-number-format'
  let price = $state<number | null>(19.99)
</script>

<NumericFormat bind:value={price} locale="en-US" options={{ precision: 2 }} />
```

Pass an explicit `locale` prop if you want consistent server/client rendering regardless of the visitor's browser language.

---

## Subpath imports

For more explicit tree-shaking, import from narrow subpaths:

```typescript
// Numeric only (skips loading pattern masking code)
import { NumericFormat, NumericText } from 'svelte-number-format/numeric'

// Pattern only (skips loading intl-number-input)
import { PatternFormat, PatternText } from 'svelte-number-format/pattern'

// Just the patterns constant
import { MaskPatterns } from 'svelte-number-format/patterns'

// Just display-only components
import { NumericText, PatternText } from 'svelte-number-format/display'
```

The root export (`svelte-number-format`) still works and includes everything. Modern bundlers tree-shake the root export correctly, but subpath imports are clearer about intent.

---

## Form-library integration

Both inputs use plain `bind:value` on a number (`NumericFormat`) or a string of raw digits (`PatternFormat`), which makes them drop-in compatible with the popular Svelte form libraries. The playground has four worked examples — source in `src/routes/demos/`:

- [`/demos/superforms`](https://pitis.github.io/svelte-number-format/demos/superforms/) — [sveltekit-superforms](https://superforms.rocks) + Zod with server-side validation and action handling
- [`/demos/formsnap`](https://pitis.github.io/svelte-number-format/demos/formsnap/) — [Formsnap](https://formsnap.dev) headless primitives on top of Superforms, auto-wiring all a11y attributes
- [`/demos/felte`](https://pitis.github.io/svelte-number-format/demos/felte/) — [Felte](https://felte.dev) with the Zod validator, fully client-side
- [`/demos/zod`](https://pitis.github.io/svelte-number-format/demos/zod/) — the same values validated through Zod 3 and Zod 4 side by side, plus the API differences that matter

The three form-library demos share one schema:

```ts
import { z } from 'zod'

export const schema = z.object({
  amount: z.number().min(0).max(1_000_000),
  phone: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits')
})
```

### Zod 3 or Zod 4? Both.

`svelte-number-format` has **no Zod dependency** — `bind:value` hands your code a plain number (`NumericFormat`) or raw string (`PatternFormat`), and validation is entirely yours. Every snippet in this README is valid Zod 3 **and** Zod 4 as written. There's a live side-by-side comparison at [`/demos/zod`](https://pitis.github.io/svelte-number-format/demos/zod/) validating the same bound values through both majors at once.

The differences that matter when you copy these patterns:

```ts
// Custom error params were renamed in Zod 4 — the string shorthand works in both
z.number().max(1_000_000, { message: 'Must be ≤ 1,000,000' }) // Zod 3
z.number().max(1_000_000, { error: 'Must be ≤ 1,000,000' }) // Zod 4
z.number().max(1_000_000, 'Must be ≤ 1,000,000') // both
```

```ts
// sveltekit-superforms (and therefore Formsnap) ships an adapter per major
import { zodClient } from 'sveltekit-superforms/adapters' // Zod 3
import { zod4Client } from 'sveltekit-superforms/adapters' // Zod 4
```

- **Felte**: `@felte/validator-zod` declares a `zod ^3` peer dependency, so use Zod 3 there.
- **SvelteKit remote form functions** accept any [Standard Schema](https://standardschema.dev) validator — Zod 3.24+ and Zod 4 both qualify, so the [remote functions recipe](#sveltekit-remote-form-functions) below works with either.

### Superforms (the standard choice)

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  import {
    NumericFormat,
    PatternFormat,
    MaskPatterns,
    NumberFormatStyle
  } from 'svelte-number-format'

  let { data } = $props()
  const { form, errors, enhance } = superForm(data.form, { dataType: 'json' })
</script>

<form method="POST" use:enhance>
  <NumericFormat
    bind:value={$form.amount}
    options={{
      formatStyle: NumberFormatStyle.Currency,
      currency: 'USD',
      precision: 2
    }}
  />
  {#if $errors.amount}<p class="error">{$errors.amount}</p>{/if}

  <PatternFormat bind:value={$form.phone} format={MaskPatterns.PHONE_US} />
  {#if $errors.phone}<p class="error">{$errors.phone}</p>{/if}

  <button type="submit">Submit</button>
</form>
```

### Felte (client-side)

```svelte
<script lang="ts">
  import { createForm } from 'felte'
  import { validator } from '@felte/validator-zod'
  import {
    NumericFormat,
    PatternFormat,
    MaskPatterns,
    NumberFormatStyle
  } from 'svelte-number-format'

  let amount = $state<number | null>(0)
  let phone = $state<string | null>('')

  const { form, errors, setFields } = createForm({
    initialValues: { amount: 0, phone: '' },
    extend: [validator({ schema })],
    onSubmit: (values) => {
      /* ... */
    }
  })

  // Skip the mount run: initialValues already seeded the store, and touching
  // the fields here would surface validation errors before any interaction.
  let amountSeeded = false
  let phoneSeeded = false
  $effect(() => {
    const v = amount ?? 0
    if (!amountSeeded) {
      amountSeeded = true
      return
    }
    setFields('amount', v, true)
  })
  $effect(() => {
    const v = phone ?? ''
    if (!phoneSeeded) {
      phoneSeeded = true
      return
    }
    setFields('phone', v, true)
  })
</script>

<form use:form>
  <NumericFormat
    name="amount"
    bind:value={amount}
    options={{
      formatStyle: NumberFormatStyle.Currency,
      currency: 'USD',
      precision: 2
    }}
  />
  <PatternFormat
    name="phone"
    bind:value={phone}
    format={MaskPatterns.PHONE_US}
  />
</form>
```

The Felte integration needs a tiny `$effect` bridge because Felte's internal store is string-keyed form data populated by DOM `name=…` attributes, while our components emit typed values via `bind:value`. Both Superforms and Formsnap avoid this because they already consume a reactive store. Note that since v2.1.0 the `name` prop lands on a hidden input carrying the raw value (see below), so Felte's initial DOM scan picks up the raw value instead of the formatted string — but hidden-input updates fire no events, so the `setFields` bridge above is still required to keep Felte's store in sync while typing.

---

## Native forms & SvelteKit remote functions

When you pass a `name` prop, both components render **two** inputs: the visible one showing the formatted value (`$1,234.56`, `(415) 555-1234`) with no `name`, and a companion `<input type="hidden">` that carries the raw value (`1234.56`, `4155551234`) under your `name`. Native `FormData` — and anything built on it, like SvelteKit form actions and remote form functions — therefore receives a machine-parseable value instead of a locale-formatted string, and framework code that writes values back into named fields never fights the formatter.

```svelte
<NumericFormat name="amount" bind:value />
<!-- renders:
  <input value="1,234.56" ... />
  <input type="hidden" name="amount" value="1234.56" />
-->
```

During SSR the hidden input already carries the raw value; the visible input is formatted on hydration.

### SvelteKit remote form functions

SvelteKit's experimental remote `form` functions (as of SvelteKit 2.27+) coerce a field from string to number when its name has the `n:` prefix. Pass that prefix directly and declare a plain number in your schema — note the prefix is an internal convention of an explicitly experimental SvelteKit feature and may change without notice:

```ts
// data.remote.ts
import * as z from 'zod'
import { form } from '$app/server'

export const postForm = form(
  z.object({ amount: z.number().min(0) }),
  async (data) => {
    // data.amount is a number
  }
)
```

```svelte
<script>
  import { NumericFormat } from 'svelte-number-format'
  import { postForm } from './data.remote'

  let value = $state(null)
</script>

<form {...postForm}>
  <NumericFormat name="n:amount" bind:value />
  <button>Submit</button>
</form>
```

Do **not** spread SvelteKit's `fields.amount.as('number')` onto the component — it sets `type="number"` on the visible input, which cannot hold a formatted value. Passing `name="n:amount"` directly gives you the same coercion without the conflict.

A few things to keep in mind:

- The hidden value is the raw JS number string: dot decimal separator regardless of locale, `0.75` (not `75`) for `Percent` style, and the integer value under `exportValueAsInteger`. With `valueType="string"` the submitted value is the normalized number string (`"10.50"` submits as `"10.5"`).
- When the value is empty, the hidden input submits `""`. For `n:`-prefixed fields SvelteKit maps `""` to `undefined` before validation, so declare optional number fields as `z.number().optional()`.
- `disabled` is mirrored onto the hidden input, so a disabled field is excluded from submission like any native control. `form` is mirrored too, for out-of-form association.
- `form.reset()` clears the field: both inputs empty out and the bound `value` is set to `null` (reset does not restore the initial prop value).
- Browsers don't autofill hidden inputs, and the visible input no longer has a `name` for autofill heuristics — pass `autocomplete` in the rest props if you need autofill hints.
- If you give the visible input an `id` equal to the `name` (the usual `<label for>` pattern), `form.elements[name]` returns a `RadioNodeList` of both elements instead of a single input — `FormData` is unaffected, but read values via `FormData` or distinct `id`s rather than `form.elements[name].value`.
- With a `name` set, the component renders two sibling elements — CSS relying on `:only-child`, `:last-child`, or `input + …` combinators around the component may need adjusting.
- `PatternFormat` with `allowEmptyFormatting` + `required`: the visible skeleton satisfies native `required` validation while the hidden input submits `""` — validate the raw value server-side rather than relying on `required`.

---

## Migrating from react-number-format

svelte-number-format mirrors react-number-format's API where possible. The big differences come from Svelte's idioms rather than missing features.

| react-number-format                    | svelte-number-format                      | Notes                                                                                                                          |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `<NumericFormat />`                    | `<NumericFormat />`                       | Same name, same concept.                                                                                                       |
| `<PatternFormat />`                    | `<PatternFormat />`                       | Same name, same concept.                                                                                                       |
| `<NumericFormat displayType="text" />` | `<NumericText />`                         | Separate component instead of a prop.                                                                                          |
| `<PatternFormat displayType="text" />` | `<PatternText />`                         | Same idea for pattern masks.                                                                                                   |
| `value={state}` + `onValueChange`      | `bind:value={state}` _or_ `onValueChange` | Use Svelte's `bind:value` — simpler, no need to wire state.                                                                    |
| `onValueChange={(v) => ...}`           | `onValueChange={(v, s) => ...}`           | Payload shape is the same: `{ floatValue, formattedValue, value }`.                                                            |
| `format="(###) ###-####"`              | `format="(###) ###-####"`                 | Same token characters (`#`, but not `A`/`*` in react-number-format's default build).                                           |
| `format` with custom patterns          | `customPatterns={{ H: /[0-9a-f]/ }}`      | Pass the regex map as a prop.                                                                                                  |
| `allowEmptyFormatting`                 | `allowEmptyFormatting`                    | Same semantics.                                                                                                                |
| `mask="_"`                             | `maskChar="_"`                            | Renamed. Only styles the placeholder/skeleton — it doesn't interleave with typed characters like react-number-format's `mask`. |
| `thousandSeparator`                    | `options.useGrouping`                     | Locale-aware — set `locale` instead of separators.                                                                             |
| `decimalSeparator`                     | Locale-aware                              | Set `locale="de-DE"` to get `1.234,56`.                                                                                        |
| `thousandsGroupStyle`                  | Locale-aware                              | Locales handle grouping (`en-IN` → `1,23,456`).                                                                                |
| `prefix` / `suffix`                    | `options.formatStyle: Currency`           | For currency, use `formatStyle` + `currency` for locale-correct symbols.                                                       |
| `valueIsNumericString`                 | `valueType="string"`                      | Emits the bound value as a string when set.                                                                                    |

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

For plain `FormData`/server submission without JS state, pass a `name` prop instead — see [Native forms & SvelteKit remote functions](#native-forms--sveltekit-remote-functions).

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

See [MIGRATION.md](./MIGRATION.md) for the full guide.

### v1.x → v2.0 breaking changes

v2.0 removes three long-deprecated APIs. None of them have functional replacements you don't already have — it's pure cleanup.

| Removed                                             | Replacement                    | Deprecated since |
| --------------------------------------------------- | ------------------------------ | ---------------- |
| `SvelteNumberFormat` (re-export of `NumericFormat`) | `NumericFormat`                | 1.0              |
| `SvelteMaskFormat` (re-export of `PatternFormat`)   | `PatternFormat`                | 1.0              |
| `<PatternFormat mask="###">` prop                   | `<PatternFormat format="###">` | 1.0              |

```svelte
<!-- v1.x -->
<script>
  import { SvelteMaskFormat } from 'svelte-number-format'
</script>
<SvelteMaskFormat mask="(###) ###-####" />

<!-- v2.0 -->
<script>
  import { PatternFormat } from 'svelte-number-format'
</script>
<PatternFormat format="(###) ###-####" />
```

The v1.2 dev-mode warning for the `mask` prop is removed in v2.0 along with the prop itself.

---

## TypeScript

Full TypeScript support with proper type definitions:

```typescript
import type { NumberInputOptions } from 'intl-number-input'
import {
  NumericFormat,
  PatternFormat,
  NumericText,
  PatternText,
  NumberFormatStyle,
  MaskPatterns
} from 'svelte-number-format'
import type {
  MaskPattern,
  NumberFormatValues,
  OnValueChange,
  SourceInfo,
  ValueChangeSource
} from 'svelte-number-format'
```

---

## FAQ

### How do I add a currency input in Svelte 5?

Install `svelte-number-format` and use `NumericFormat` with `options={{ formatStyle: NumberFormatStyle.Currency, currency: 'USD', precision: 2 }}` — see the [Quick Start](#quick-start) above. The input formats as you type (`1234.56` → `$1,234.56`), keeps the caret stable, and `bind:value` gives you the plain number, not the formatted string.

### Does it work with Svelte 4?

No. The library is built on Svelte 5 runes (`$state`, `$props`, `$effect`) and declares a `svelte@^5` peer dependency. There is no Svelte 4 build.

### How big is it?

`PatternFormat` (via `svelte-number-format/pattern`) is **3.9 kB gzipped with zero runtime dependencies**. `NumericFormat` is **~7.6 kB gzipped** including its only dependency, [intl-number-input](https://www.npmjs.com/package/intl-number-input) (its own code is 2.2 kB). [Subpath imports](#subpath-imports) let you load only what you use. Numbers are gzipped package source, pinned by size-limit budgets in CI.

### How is it different from react-number-format?

Same `NumericFormat` and `PatternFormat` component names, same `onValueChange` payload, and the same `#` pattern token — plus `A`/`*` and custom regex tokens that react-number-format doesn't have. The API is idiomatic Svelte: `bind:value` instead of controlled-state wiring, locale-driven separators (`locale="de-DE"` → `1.234,56 €`) instead of manual `thousandSeparator`/`prefix` props, and separate `NumericText`/`PatternText` components instead of `displayType="text"`. The [migration table](#migrating-from-react-number-format) maps the common props.

### How is it different from svelte-currency-input?

[svelte-currency-input](https://github.com/fmaclen/svelte-currency-input) is a focused, well-made currency-only field — if that's all you need, it's a fine choice. `svelte-number-format` covers currency **plus** percent and decimal inputs, pattern masks (phone, credit card, dates, custom tokens), display-only components, and mirrors react-number-format's API.

### Does it work with Superforms, Formsnap, or Felte?

Yes — both inputs expose plain `bind:value`, so they drop into any Svelte form library. There are [live demos](https://pitis.github.io/svelte-number-format/demos/) with worked source for Superforms, Formsnap, Felte, and Zod validation. See [Form-library integration](#form-library-integration).

### Is it SSR-safe with SvelteKit?

Yes. No browser APIs run at module evaluation; the default locale resolves lazily (`navigator.language` on the client, `'en-US'` on the server). The input components render on the server and format on hydration; `NumericText`/`PatternText` render fully formatted markup during SSR — see [SSR / SvelteKit](#ssr--sveltekit).

### Can I submit the raw value in a native form?

Yes — pass a `name` prop and a hidden input carries the raw value (`1234.56`, not `$1,234.56`) into `FormData`, form actions, and SvelteKit remote functions. See [Native forms](#native-forms--sveltekit-remote-functions).

---

## Browser Support

- Svelte 5+
- Modern evergreen browsers — the same baseline as Svelte 5, whose Proxy-based reactivity cannot be polyfilled
- `Intl.NumberFormat` with `formatToParts` (ES2018+); no Internet Explorer support

---

## Contributing

Contributions are welcome! This project uses:

- **Husky** - Git hooks for quality checks
- **lint-staged** - Run checks on staged files only
- **Pre-commit hooks** - Automatic formatting and linting (tests run when spec files are staged)

Before each commit, the following runs automatically:

- ✅ Prettier formatting
- ✅ ESLint linting with auto-fix
- ✅ Tests when spec/test files are among the staged changes (`vitest related`)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development setup and guidelines.

---

## License

MIT © [Pitis Radu](https://github.com/pitis)

---

## Acknowledgments

- Inspired by [react-number-format](https://www.npmjs.com/package/react-number-format)
- Built on [intl-number-input](https://www.npmjs.com/package/intl-number-input)

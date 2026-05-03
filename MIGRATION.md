# Migration Guide

## v1.x → v2.0

v2.0 removes three long-deprecated APIs. None of them have functional
replacements you don't already have — it's pure cleanup. If you've kept
your imports and props up to date with the v1.x release notes, no changes
are needed.

### Removed

| Removed                                             | Replacement                    | Deprecated since |
| --------------------------------------------------- | ------------------------------ | ---------------- |
| `SvelteNumberFormat` (re-export of `NumericFormat`) | `NumericFormat`                | 1.0              |
| `SvelteMaskFormat` (re-export of `PatternFormat`)   | `PatternFormat`                | 1.0              |
| `<PatternFormat mask="###">` prop                   | `<PatternFormat format="###">` | 1.0              |

#### Imports

```diff
- import { SvelteNumberFormat } from 'svelte-number-format'
+ import { NumericFormat } from 'svelte-number-format'

- import { SvelteMaskFormat } from 'svelte-number-format'
+ import { PatternFormat } from 'svelte-number-format'
```

#### `mask` → `format` prop

```diff
- <PatternFormat bind:value={phone} mask="(###) ###-####" />
+ <PatternFormat bind:value={phone} format="(###) ###-####" />
```

The dev-mode warning that v1.x emitted when you used the `mask` prop is
removed in v2.0 along with the prop itself.

### New in v2.0

You don't have to adopt these to upgrade — they're additive.

#### Display-only components

`NumericText` and `PatternText` render formatted values as a `<span>` with
no input behavior. Useful for read-only views, tables, and emails (SSR-safe).

```svelte
<script>
  import {
    NumericText,
    PatternText,
    NumberFormatStyle
  } from 'svelte-number-format'
</script>

<NumericText
  value={1234.56}
  locale="en-US"
  options={{ formatStyle: NumberFormatStyle.Currency, currency: 'USD' }}
/>
<!-- → <span>$1,234.56</span> -->

<PatternText value="4155551234" format="(###) ###-####" />
<!-- → <span>(415) 555-1234</span> -->
```

#### Subpath imports

Tree-shake by importing only what you use:

```js
import { NumericFormat } from 'svelte-number-format/numeric'
import { PatternFormat } from 'svelte-number-format/pattern'
import { MaskPatterns } from 'svelte-number-format/patterns'
import { NumericText, PatternText } from 'svelte-number-format/display'
```

#### `onValueChange` callback

Both `NumericFormat` and `PatternFormat` now expose an `onValueChange`
callback whose signature mirrors `react-number-format`:

```svelte
<NumericFormat
  bind:value={amount}
  onValueChange={(values, sourceInfo) => {
    // values.floatValue, values.formattedValue, values.value
    // sourceInfo.source: 'event' | 'prop'
  }}
/>
```

#### `valueType` on `NumericFormat`

If you'd rather bind a string than a number (form libraries that JSON-encode
numbers, schema validators that want strings, etc.), set `valueType="string"`:

```svelte
<NumericFormat bind:value={amount} valueType="string" />
```

#### `customPatterns` on `PatternFormat`

Override or add pattern characters with custom regexes:

```svelte
<PatternFormat
  bind:value={license}
  format="AAA-####"
  customPatterns={{ A: /[A-Z]/ }}
/>
```

### SSR

`v2.0` resolves the default locale lazily (`navigator.language` is no longer
read at module import), so `NumericFormat`, `PatternFormat`, `NumericText`,
and `PatternText` all render correctly under `svelte/server`. If you were
working around SSR issues in v1.x with conditional rendering, you can drop
those guards.

### Recommended migration steps

1. Search your codebase for `SvelteNumberFormat` and `SvelteMaskFormat` —
   replace with `NumericFormat` / `PatternFormat`.
2. Search for `<PatternFormat ... mask=` and rename `mask` to `format`.
3. Run your test suite.
4. (Optional) Switch heavy `<NumericFormat readonly>` instances to
   `<NumericText>` for a smaller render footprint.
5. (Optional) Switch to subpath imports for slightly better tree-shaking.

# Migration Guide

## Component Renaming (v1.x to v2.x)

Following the naming convention established by [react-number-format](https://www.npmjs.com/package/react-number-format), we've renamed the components for better clarity:

### Component Names

| Old Name              | New Name         | Purpose                                    |
| --------------------- | ---------------- | ------------------------------------------ |
| `SvelteNumberFormat`  | `NumericFormat`  | Number formatting (currency, percentages)  |
| `SvelteMaskFormat`    | `PatternFormat`  | Pattern-based masking (phone, cards, etc.) |

### API Changes

#### NumericFormat (formerly SvelteNumberFormat)
No API changes - works exactly the same, just import the new name:

```diff
- import { SvelteNumberFormat } from 'svelte-number-format'
+ import { NumericFormat } from 'svelte-number-format'

- <SvelteNumberFormat bind:value={amount} />
+ <NumericFormat bind:value={amount} />
```

#### PatternFormat (formerly SvelteMaskFormat)
The `mask` prop has been renamed to `format` (though `mask` still works for backwards compatibility):

```diff
- import { SvelteMaskFormat } from 'svelte-number-format'
+ import { PatternFormat } from 'svelte-number-format'

- <SvelteMaskFormat bind:value={phone} mask="(###) ###-####" />
+ <PatternFormat bind:value={phone} format="(###) ###-####" />
```

### Backwards Compatibility

The old component names are still exported and work identically to the new ones. You can migrate at your own pace:

```js
// Both of these work:
import { SvelteNumberFormat } from 'svelte-number-format'  // Old (deprecated)
import { NumericFormat } from 'svelte-number-format'        // New (recommended)

// Both of these work:
import { SvelteMaskFormat } from 'svelte-number-format'    // Old (deprecated)
import { PatternFormat } from 'svelte-number-format'        // New (recommended)
```

### Why the Change?

1. **Industry Standard**: Matches the naming convention of `react-number-format`, making it familiar to developers
2. **Clearer Purpose**: `NumericFormat` and `PatternFormat` better describe what each component does
3. **Better Separation**: Clear distinction between number formatting and pattern masking
4. **Framework Agnostic**: Removes "Svelte" from the component names, focusing on functionality

### Recommended Migration Steps

1. Update imports to use new component names
2. For `PatternFormat`, rename `mask` prop to `format`
3. Test your application
4. Remove old imports once verified

The old names will be maintained for backwards compatibility but may be removed in a future major version.


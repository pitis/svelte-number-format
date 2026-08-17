# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] — 2026-08-18

### Fixed

- `NumericFormat` and `PatternFormat` now submit the raw value in native forms
  ([#15](https://github.com/pitis/svelte-number-format/issues/15)). When `name`
  is set, the component renders a companion `<input type="hidden">` carrying the
  raw value (`1234.56` / unmasked digits, never the mask skeleton) and leaves
  the visible formatted input unnamed, so `FormData`, SvelteKit form actions,
  and SvelteKit remote form functions (`name="n:amount"` + `z.number()`) receive
  a parseable value instead of a locale-formatted string.
- An empty-string `value` no longer coerces to `0` — it renders and submits as
  empty, matching native inputs.
- `PatternFormat` normalizes a parent-provided `value` through the mask before
  submitting, so the payload always matches what the visible input displays.
- The hidden value follows `valueRange` clamping, so the payload always matches
  the clamped value the visible input displays.

### Added

- `form` prop on both components, applied to the visible and hidden inputs for
  out-of-form association.
- `disabled` prop on both components, mirrored onto the hidden input so
  disabled fields are excluded from submission like any native control.

### Changed

- **`name` no longer reaches the visible input** — it lands on the hidden
  raw-value input instead. Consequences for existing users passing `name`:
  forms receive the raw value instead of the formatted string; CSS or test
  selectors like `input[name="amount"]` now match the hidden input (target the
  visible input by `id` or `input:not([type="hidden"])`); with `id` equal to
  `name`, `form.elements[name]` returns a `RadioNodeList` of both elements.
  See MIGRATION.md.
- `form.reset()` now clears the field: both inputs empty out and the bound
  `value` is set to `null` (previously the bound value went stale).

## [2.0.0] — 2026-05-03

### Added

- `NumericText` and `PatternText` display-only components — render formatted
  values as a `<span>` with no input behavior, SSR-safe.
- Subpath exports: `svelte-number-format/numeric`, `/pattern`, `/patterns`,
  `/display` for finer-grained tree-shaking.
- `onValueChange` callback on `NumericFormat` and `PatternFormat`, mirroring
  the `react-number-format` signature (`{ floatValue, formattedValue, value }`,
  `{ event, source }`).
- `valueType` prop and string-value support on `NumericFormat`
  (`'number' | 'string'`).
- `customPatterns` prop on `PatternFormat` for user-defined mask characters.
- `MaskPatterns` constants: `PHONE_US`, `PHONE_INTERNATIONAL`, `DATE_US`,
  `DATE_ISO`, `CREDIT_CARD`, `CREDIT_CARD_AMEX`, `SSN`, `ZIP_US`, `IPV4`,
  `MAC_ADDRESS`, and more.
- SSR test suite (`src/lib/ssr.spec.ts`) running under Node with no DOM.
- Form-library integration demos under `/demos`: Superforms, Formsnap, Felte.
- CI bundle-size check via `size-limit`.

### Changed

- Rewrote `PatternFormat` with a cursor-aware mask engine that preserves
  caret position across input, paste, and backspace events.
- Locale resolution is now lazy via `defaultLocale()` so components no longer
  read `navigator.language` at module import — required for SSR.
- Vitest configuration split into `browser` (jsdom) and `ssr` (node) projects.

### Removed

- **BREAKING**: `SvelteNumberFormat` re-export (use `NumericFormat`).
- **BREAKING**: `SvelteMaskFormat` re-export (use `PatternFormat`).
- **BREAKING**: `mask` prop on `PatternFormat` (use `format`).

See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions.

---

## Earlier releases

Releases prior to 2.0.0 are tagged in the git history. See
[the releases page](https://github.com/pitis/svelte-number-format/releases)
for a per-version summary.

# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] — 2026-08-18

### Fixed

- `NumericFormat` and `PatternFormat` now submit the raw value in native forms
  ([#15](https://github.com/pitis/svelte-number-format/issues/15)). When `name`
  is set, the component renders a companion `<input type="hidden">` carrying the
  raw value (`1234.56` / unmasked digits, never the mask skeleton) and leaves
  the visible formatted input unnamed, so `FormData`, SvelteKit form actions,
  and SvelteKit remote form functions (`name="n:amount"` + `z.number()`) receive
  a parseable value instead of a locale-formatted string. A `form` attribute,
  when provided, is applied to both inputs. Note: if you relied on forms
  submitting the _formatted_ string under `name`, that payload is now the raw
  value.

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

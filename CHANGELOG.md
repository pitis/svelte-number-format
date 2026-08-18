# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

No library code changes — docs, demo site, and package metadata only.

### Added

- README: FAQ section (currency how-to, Svelte 4, bundle size, comparisons
  with react-number-format and svelte-currency-input, form libraries, SSR,
  native forms) plus measured gzipped sizes in Features.
- Demo site: `llms.txt` context file for AI crawlers and agents.
- Size-limit budgets tightened to pin the sizes advertised in the README and
  `llms.txt` (including a new budget for the `intl-number-input` dependency),
  so CI fails if the published numbers go stale.

### Changed

- Package description now leads with "currency, number and masked input
  components" and names all four components; added the `currency-input`
  keyword. The GitHub repo description was updated to match.

## [2.1.1] — 2026-08-18

No library code changes — docs, demo site, and tooling only.

### Fixed

- README: the Felte integration example marked fields as touched on mount
  (`setFields(…, true)` inside a mount-run `$effect`), surfacing validation
  errors before any user interaction. The example now skips the initial sync
  and only touches on real changes; the live Felte demo got the same fix.
- Demo site: links with trailing slashes (`/demos/felte/`) returned 404 on
  GitHub Pages because pages were prerendered as bare `.html` files. Every
  route now prerenders as `directory/index.html` (`trailingSlash: 'always'`),
  so both URL forms resolve.
- Demo site: the version badge was hardcoded to `2.0.0`; it now reads the
  version from `package.json` at build time and tracks the latest release.

### Added

- README: "Zod 3 or Zod 4? Both." section — the library has no Zod dependency,
  every README snippet is valid in both majors, and the differences that matter
  are listed (error param rename, `zodClient` vs `zod4Client` superforms
  adapters, Felte's `zod ^3` peer, Standard Schema support in SvelteKit remote
  form functions).
- Demo site: live `/demos/zod` page validating the same bound values through
  Zod 3 and Zod 4 side by side, a `/demos` overview page, and a Demos link in
  the main navigation.
- README: the `valueRange` option row now states that out-of-range values are
  silently clamped on blur.

### Changed

- Demo site: the demos section shares the main page's design system, including
  dark mode; the form-library demos surface the Zod schema error instead of
  silently clamping the amount via `valueRange`.
- Tooling (contributors only): Vite 8, vite-plugin-svelte 7, TypeScript 6,
  ESLint 10, and current minors across the toolchain — groundwork for
  SvelteKit 3 once it leaves RC.

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

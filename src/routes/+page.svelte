<script lang="ts">
  import { onMount } from 'svelte'
  import { base } from '$app/paths'
  import {
    NumericFormat,
    PatternFormat,
    NumericText,
    NumberFormatStyle,
    MaskPatterns,
    Validators
  } from '../lib/index.js'
  import pkg from '../../package.json' with { type: 'json' }
  import SeoHead from './SeoHead.svelte'

  const VERSION = pkg.version

  // Concatenated so the Svelte parser never sees a literal closing script tag.
  const jsonLd = (data: object) =>
    '<script type="application/ld+json">' +
    JSON.stringify(data).replace(/</g, '\\u003c') +
    '</scr' +
    'ipt>'

  const jsonLdTag = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'svelte-number-format',
    description: pkg.description,
    url: 'https://pitis.github.io/svelte-number-format/',
    codeRepository: 'https://github.com/pitis/svelte-number-format',
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Svelte 5',
    license: 'https://opensource.org/license/mit/',
    version: pkg.version,
    author: {
      '@type': 'Person',
      name: 'Pitiș Radu',
      url: 'https://github.com/pitis'
    }
  })

  // Rendered in the FAQ section below AND emitted as FAQPage JSON-LD — one
  // source so the schema can never drift from the visible text. Keep answers
  // in sync with the README's FAQ section.
  const faq = [
    {
      q: 'How do I add a currency input in Svelte 5?',
      a: "Install svelte-number-format and use NumericFormat with options={{ formatStyle: NumberFormatStyle.Currency, currency: 'USD', precision: 2 }}. It formats as you type, keeps the caret stable, and bind:value gives you the plain number — not the formatted string."
    },
    {
      q: 'Does it work with Svelte 4?',
      a: 'No. The library is built on Svelte 5 runes and declares a svelte@^5 peer dependency. There is no Svelte 4 build.'
    },
    {
      q: 'How big is it?',
      a: 'PatternFormat is 4.6 kB gzipped with zero runtime dependencies; NumericFormat is ~8.1 kB gzipped including its only dependency, intl-number-input. Subpath imports let you load only what you use. Numbers are gzipped package source, pinned by size-limit budgets in CI.'
    },
    {
      q: 'How is it different from react-number-format?',
      a: "Same NumericFormat and PatternFormat component names, same onValueChange payload, and the same # pattern token — plus A/* and custom regex tokens that react-number-format doesn't have. The API is idiomatic Svelte: bind:value instead of controlled-state wiring, and locale-driven separators instead of manual thousandSeparator/prefix props."
    },
    {
      q: 'How is it different from svelte-currency-input?',
      a: "svelte-currency-input is a focused, well-made currency-only field — if that's all you need, it's a fine choice. svelte-number-format covers currency plus percent and decimal inputs, pattern masks for phone, credit card and dates, display-only components, and mirrors react-number-format's API."
    },
    {
      q: 'Does it work with Superforms, Formsnap, or Felte?',
      a: 'Yes — both inputs expose plain bind:value, so they drop into any Svelte form library. The demos on this site show worked integrations with Superforms, Formsnap, Felte, and Zod validation.'
    },
    {
      q: 'Is it SSR-safe with SvelteKit?',
      a: "Yes. No browser APIs run at module evaluation; the default locale resolves lazily — navigator.language on the client, 'en-US' on the server. The input components render on the server and format on hydration; NumericText and PatternText render fully formatted markup during SSR."
    },
    {
      q: 'Can I submit the raw value in a native form?',
      a: 'Yes — pass a name prop and a hidden input carries the raw value (1234.56, not $1,234.56) into FormData, form actions, and SvelteKit remote functions. The visible formatted input stays unnamed.'
    }
  ]

  const faqLdTag = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  })

  // ── Theme ─────────────────────────────────────────────────────────────────
  let dark = $state(false)

  onMount(() => {
    // app.html's inline script already resolved the theme before first paint.
    dark = document.documentElement.dataset.theme === 'dark'
  })

  $effect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('snf-theme', dark ? 'dark' : 'light')
    }
  })

  // ── Hero playground ───────────────────────────────────────────────────────
  type PgTab = 'currency' | 'percent' | 'decimal' | 'phone' | 'card'
  let pgTab = $state<PgTab>('currency')

  let pgCurrency = $state<number | null>(1234.56)
  let pgPercent = $state<number | null>(0.0875)
  let pgDecimal = $state<number | null>(1234567.89)
  let pgPhone = $state<string | null>('5551234567')
  let pgCard = $state<string | null>('4242424242424242')

  let pgLocale = $state('en-US')
  let pgCurrencyCode = $state('USD')
  let pgPrecision = $state(2)

  const pgIsNumeric = $derived(
    pgTab === 'currency' || pgTab === 'percent' || pgTab === 'decimal'
  )

  const pgPattern = $derived(
    pgTab === 'phone'
      ? MaskPatterns.PHONE_US
      : pgTab === 'card'
        ? MaskPatterns.CREDIT_CARD
        : ''
  )

  const pgRaw = $derived.by(() => {
    if (pgTab === 'currency') return pgCurrency
    if (pgTab === 'percent') return pgPercent
    if (pgTab === 'decimal') return pgDecimal
    if (pgTab === 'phone') return pgPhone
    return pgCard
  })

  const pgFormatted = $derived.by(() => {
    if (pgIsNumeric) {
      const n = pgRaw as number | null
      if (n == null) return ''
      try {
        const opts: Intl.NumberFormatOptions = {
          minimumFractionDigits: pgPrecision,
          maximumFractionDigits: pgPrecision
        }
        if (pgTab === 'currency') {
          opts.style = 'currency'
          opts.currency = pgCurrencyCode
        } else if (pgTab === 'percent') {
          opts.style = 'percent'
        }
        return new Intl.NumberFormat(pgLocale, opts).format(n)
      } catch {
        return String(n)
      }
    }
    const raw = (pgRaw as string | null) ?? ''
    return applyMaskDisplay(raw, pgPattern)
  })

  function applyMaskDisplay(raw: string, pattern: string): string {
    if (!raw || !pattern) return raw
    let out = ''
    let ri = 0
    for (let i = 0; i < pattern.length && ri < raw.length; i++) {
      const ch = pattern[i]
      const r = raw[ri]
      if (ch === '#') {
        if (/\d/.test(r)) {
          out += r
          ri++
        } else {
          ri++
          i--
        }
      } else if (ch === 'A') {
        if (/[a-zA-Z]/.test(r)) {
          out += r
          ri++
        } else {
          ri++
          i--
        }
      } else if (ch === '*') {
        if (/[a-zA-Z0-9]/.test(r)) {
          out += r
          ri++
        } else {
          ri++
          i--
        }
      } else {
        out += ch
      }
    }
    return out
  }

  type Preset = { label: string; apply: () => void }
  const pgPresets = $derived.by<Preset[]>(() => {
    if (pgTab === 'currency')
      return [
        { label: 'Coffee', apply: () => (pgCurrency = 4.5) },
        { label: 'Subscription', apply: () => (pgCurrency = 99) },
        { label: 'Invoice', apply: () => (pgCurrency = 12480.5) },
        { label: 'Reset', apply: () => (pgCurrency = null) }
      ]
    if (pgTab === 'percent')
      return [
        { label: 'APY', apply: () => (pgPercent = 0.0425) },
        { label: 'Fee', apply: () => (pgPercent = 0.029) },
        { label: 'Tax', apply: () => (pgPercent = 0.21) },
        { label: 'Reset', apply: () => (pgPercent = null) }
      ]
    if (pgTab === 'decimal')
      return [
        { label: 'Million', apply: () => (pgDecimal = 1_000_000) },
        { label: 'Pi×100k', apply: () => (pgDecimal = 314159.27) },
        { label: 'Negative', apply: () => (pgDecimal = -42.5) },
        { label: 'Reset', apply: () => (pgDecimal = null) }
      ]
    if (pgTab === 'phone')
      return [
        { label: 'Test #', apply: () => (pgPhone = '5551234567') },
        { label: 'SF', apply: () => (pgPhone = '4155550199') },
        { label: 'NY', apply: () => (pgPhone = '2125555512') },
        { label: 'Clear', apply: () => (pgPhone = '') }
      ]
    return [
      { label: 'Visa', apply: () => (pgCard = '4242424242424242') },
      { label: 'MC', apply: () => (pgCard = '5555555555554444') },
      { label: 'Amex', apply: () => (pgCard = '378282246310005') },
      { label: 'Clear', apply: () => (pgCard = '') }
    ]
  })

  // ── Numeric showcase ──────────────────────────────────────────────────────
  let showCurrency = $state<number | null>(99.99)
  let showPercent = $state<number | null>(0.0875)
  let showDecimal = $state<number | null>(1234567.89)

  // ── Pattern showcase ──────────────────────────────────────────────────────
  const patternDemos: Array<{
    id: string
    name: string
    tag: string
    pattern: string
    validate?: (raw: string) => boolean
  }> = [
    {
      id: 'phone',
      name: 'Phone (US)',
      tag: 'PHONE_US',
      pattern: MaskPatterns.PHONE_US
    },
    {
      id: 'card',
      name: 'Credit Card',
      tag: 'CREDIT_CARD',
      pattern: MaskPatterns.CREDIT_CARD
    },
    { id: 'ssn', name: 'SSN', tag: 'SSN', pattern: MaskPatterns.SSN },
    {
      id: 'date',
      name: 'Date (US)',
      tag: 'DATE_US',
      pattern: MaskPatterns.DATE_US
    },
    {
      id: 'cpf',
      name: 'CPF · validated',
      tag: 'BRAZILIAN_CPF',
      pattern: MaskPatterns.BRAZILIAN_CPF,
      validate: Validators.BRAZILIAN_CPF
    },
    { id: 'ip', name: 'IPv4', tag: 'IPV4', pattern: MaskPatterns.IPV4 },
    {
      id: 'mac',
      name: 'MAC Address',
      tag: 'MAC_ADDRESS',
      pattern: MaskPatterns.MAC_ADDRESS
    }
  ]

  const patternValues = $state<Record<string, string | null>>({
    phone: '4155550199',
    card: '4242424242424242',
    ssn: '123456789',
    date: '12252024',
    cpf: '14550200286',
    ip: '192168011',
    mac: 'a4c138ff0211'
  })

  // ── Locale gallery ────────────────────────────────────────────────────────
  let galleryNumber = $state<number | null>(1234567.89)
  let galleryStyle = $state<'decimal' | 'currency' | 'percent'>('currency')
  let galleryActive = $state('en-US')

  const locales = [
    { id: 'en-US', name: 'United States', ccy: 'USD' },
    { id: 'de-DE', name: 'Germany', ccy: 'EUR' },
    { id: 'fr-FR', name: 'France', ccy: 'EUR' },
    { id: 'ja-JP', name: 'Japan', ccy: 'JPY' },
    { id: 'en-GB', name: 'United Kingdom', ccy: 'GBP' },
    { id: 'pt-BR', name: 'Brazil', ccy: 'BRL' },
    { id: 'hi-IN', name: 'India', ccy: 'INR' },
    { id: 'sv-SE', name: 'Sweden', ccy: 'SEK' }
  ] as const

  function localeOptions(ccy: string) {
    if (galleryStyle === 'currency')
      return {
        formatStyle: NumberFormatStyle.Currency,
        currency: ccy,
        precision: 2
      }
    if (galleryStyle === 'percent')
      return { formatStyle: NumberFormatStyle.Percent, precision: 2 }
    return { formatStyle: NumberFormatStyle.Decimal, precision: 2 }
  }

  // For the percent style we divide by 1000 so a default like 1234567.89
  // doesn't render as "12345678900%" — same trick the design prototype uses.
  const galleryDisplayValue = $derived.by(() => {
    if (galleryNumber == null) return null
    return galleryStyle === 'percent' ? galleryNumber / 1000 : galleryNumber
  })

  // ── Install ───────────────────────────────────────────────────────────────
  let pkgManager = $state<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm')
  const installCmd = $derived(
    pkgManager === 'pnpm'
      ? 'pnpm add svelte-number-format'
      : pkgManager === 'yarn'
        ? 'yarn add svelte-number-format'
        : pkgManager === 'bun'
          ? 'bun add svelte-number-format'
          : 'npm i svelte-number-format'
  )

  // ── Copy state ────────────────────────────────────────────────────────────
  let copiedKey = $state<string | null>(null)
  function copy(key: string, text: string) {
    navigator.clipboard?.writeText(text)
    copiedKey = key
    setTimeout(() => {
      if (copiedKey === key) copiedKey = null
    }, 1400)
  }

  // ── Features list ─────────────────────────────────────────────────────────
  const features = [
    {
      num: '01',
      title: 'Caret stable',
      desc: 'Type, paste, delete from the middle. The caret never jumps to the end.',
      glyph: '1,2|34.56'
    },
    {
      num: '02',
      title: 'Two-way binding',
      desc: 'bind:value works exactly like a native input. Programmatic updates re-format on the spot.',
      glyph: '$ ↔ 99.99'
    },
    {
      num: '03',
      title: 'Locale-aware',
      desc: 'Built on Intl.NumberFormat. Switch between en-US, de-DE, ja-JP without re-mounting.',
      glyph: '1,234 / 1.234 / 1 234'
    },
    {
      num: '04',
      title: 'Currency, %, decimal',
      desc: 'NumericFormat covers the three styles you actually use, with precision and grouping.',
      glyph: '$ · % · #'
    },
    {
      num: '05',
      title: '15+ pattern masks',
      desc: 'Phone, credit card, SSN, dates, IPs, MAC — drop in MaskPatterns.* and ship.',
      glyph: '###-##-####'
    },
    {
      num: '06',
      title: 'Svelte 5 native',
      desc: 'Built for runes ($state, $derived). No legacy stores, no compat shims.',
      glyph: '$state'
    },
    {
      num: '07',
      title: 'TypeScript first',
      desc: 'Strict types throughout. Autocomplete on every option, every mask.',
      glyph: '<T>'
    },
    {
      num: '08',
      title: 'SSR-safe display',
      desc: 'NumericText and PatternText render formatted values server-side with no DOM.',
      glyph: '<span> · SSR'
    }
  ]

  // ── Code examples ─────────────────────────────────────────────────────────
  type Tok = [string, string]
  type CodeLine = Tok[]

  const codeCurrency: { file: string; raw: string; lines: CodeLine[] } = {
    file: 'Currency.svelte',
    raw: [
      '<script lang="ts">',
      "  import { NumericFormat, NumberFormatStyle } from 'svelte-number-format'",
      '',
      '  let price = $state<number | null>(99.99)',
      '<' + '/script>',
      '',
      '<NumericFormat',
      '  bind:value={price}',
      '  locale="en-US"',
      '  options={{',
      '    formatStyle: NumberFormatStyle.Currency,',
      "    currency: 'USD', precision: 2",
      '  }}',
      '/>',
      '<!-- User sees: $99.99 -->'
    ].join('\n'),
    lines: [
      [
        ['<', 'pun'],
        ['script', 'tag'],
        [' ', ''],
        ['lang', 'attr'],
        ['=', 'pun'],
        ['"ts"', 'str'],
        ['>', 'pun']
      ],
      [
        ['  import', 'key'],
        [' { ', 'pun'],
        ['NumericFormat', 'fn'],
        [', ', 'pun'],
        ['NumberFormatStyle', 'fn'],
        [' } ', 'pun'],
        ['from', 'key'],
        [' ', ''],
        ["'svelte-number-format'", 'str']
      ],
      [],
      [
        ['  let', 'key'],
        [' price ', ''],
        ['= ', 'pun'],
        ['$state', 'fn'],
        ['<', 'pun'],
        ['number', 'tag'],
        [' | ', 'pun'],
        ['null', 'key'],
        ['>(', 'pun'],
        ['99.99', 'num'],
        [')', 'pun']
      ],
      [
        ['<', 'pun'],
        ['/script>', 'tag']
      ],
      [],
      [
        ['<', 'pun'],
        ['NumericFormat', 'tag']
      ],
      [
        ['  ', ''],
        ['bind:value', 'attr'],
        ['=', 'pun'],
        ['{', 'pun'],
        ['price', 'fn'],
        ['}', 'pun']
      ],
      [
        ['  ', ''],
        ['locale', 'attr'],
        ['=', 'pun'],
        ['"en-US"', 'str']
      ],
      [
        ['  ', ''],
        ['options', 'attr'],
        ['=', 'pun'],
        ['{{', 'pun']
      ],
      [
        ['    formatStyle: ', ''],
        ['NumberFormatStyle', 'fn'],
        ['.', 'pun'],
        ['Currency', 'tag'],
        [',', 'pun']
      ],
      [
        ['    currency: ', ''],
        ["'USD'", 'str'],
        [', precision: ', 'pun'],
        ['2', 'num']
      ],
      [['  }}', 'pun']],
      [['/>', 'pun']],
      [['<!-- User sees: $99.99 -->', 'com']]
    ]
  }

  const codePhone: { file: string; raw: string; lines: CodeLine[] } = {
    file: 'Phone.svelte',
    raw: [
      '<script lang="ts">',
      "  import { PatternFormat, MaskPatterns } from 'svelte-number-format'",
      '',
      '  let phone = $state<string | null>(null)',
      '<' + '/script>',
      '',
      '<PatternFormat',
      '  bind:value={phone}',
      '  format={MaskPatterns.PHONE_US}',
      '  placeholder="(555) 123-4567"',
      '/>',
      '<!-- Display: (555) 123-4567 · raw: "5551234567" -->'
    ].join('\n'),
    lines: [
      [
        ['<', 'pun'],
        ['script', 'tag'],
        [' ', ''],
        ['lang', 'attr'],
        ['=', 'pun'],
        ['"ts"', 'str'],
        ['>', 'pun']
      ],
      [
        ['  import', 'key'],
        [' { ', 'pun'],
        ['PatternFormat', 'fn'],
        [', ', 'pun'],
        ['MaskPatterns', 'fn'],
        [' } ', 'pun'],
        ['from', 'key'],
        [' ', ''],
        ["'svelte-number-format'", 'str']
      ],
      [],
      [
        ['  let', 'key'],
        [' phone ', ''],
        ['= ', 'pun'],
        ['$state', 'fn'],
        ['<', 'pun'],
        ['string', 'tag'],
        [' | ', 'pun'],
        ['null', 'key'],
        ['>(', 'pun'],
        ['null', 'key'],
        [')', 'pun']
      ],
      [
        ['<', 'pun'],
        ['/script>', 'tag']
      ],
      [],
      [
        ['<', 'pun'],
        ['PatternFormat', 'tag']
      ],
      [
        ['  ', ''],
        ['bind:value', 'attr'],
        ['=', 'pun'],
        ['{', 'pun'],
        ['phone', 'fn'],
        ['}', 'pun']
      ],
      [
        ['  ', ''],
        ['format', 'attr'],
        ['=', 'pun'],
        ['{', 'pun'],
        ['MaskPatterns', 'fn'],
        ['.', 'pun'],
        ['PHONE_US', 'tag'],
        ['}', 'pun']
      ],
      [
        ['  ', ''],
        ['placeholder', 'attr'],
        ['=', 'pun'],
        ['"(555) 123-4567"', 'str']
      ],
      [['/>', 'pun']],
      [['<!-- Display: (555) 123-4567 · raw: "5551234567" -->', 'com']]
    ]
  }
</script>

<!-- This meta description is hand-written; the JSON-LD description injected
     below comes from package.json — keep the two telling the same story. -->
<SeoHead
  title="svelte-number-format — Number, Currency & Masked Input for Svelte 5"
  description="Reactive number, currency, percent and pattern-masked input components for Svelte 5 — caret-stable formatting, two-way binding, Intl locale support, SSR-safe."
  path="/"
/>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- static JSON-LD, no user input -->
  {@html jsonLdTag}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- static JSON-LD, no user input -->
  {@html faqLdTag}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  <!-- ── Nav ─────────────────────────────────────────────────────────────── -->
  <header class="nav">
    <div class="nav-inner">
      <a href="#top" class="brand">
        <span class="brand-mark">#</span>
        <span>svelte-number-format</span>
      </a>
      <span class="nav-version mono">v{VERSION}</span>
      <nav class="nav-links" aria-label="Primary">
        <a class="nav-link" href="#features">Features</a>
        <a class="nav-link" href="#numeric">Numeric</a>
        <a class="nav-link" href="#pattern">Pattern</a>
        <a class="nav-link" href="#locales">Locales</a>
        <a class="nav-link" href="#faq">FAQ</a>
        <a class="nav-link" href="#install">Install</a>
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a class="nav-link" href="{base}/demos/">Demos</a>
        <button
          type="button"
          class="icon-btn"
          onclick={() => (dark = !dark)}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          title="Toggle theme"
        >
          {#if dark}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
              />
            </svg>
          {:else}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          {/if}
        </button>
      </nav>
    </div>
  </header>

  <!-- ── Hero ────────────────────────────────────────────────────────────── -->
  <section class="hero" id="top">
    <div class="container">
      <div class="hero-grid">
        <div>
          <span class="eyebrow">
            <span class="dot" aria-hidden="true"></span>
            Svelte 5 · v{VERSION} · MIT
          </span>
          <h1 class="hero-title">
            Numbers,<br />formatted <em>right.</em>
          </h1>
          <p class="hero-sub">
            A reactive input component library for Svelte 5 with caret-stable
            formatting, two-way binding, and Intl-grade locale support. Four
            components, 15+ masks, zero glue code.
          </p>
          <div class="hero-actions">
            <div class="install" role="group" aria-label="Install command">
              <code class="install-cmd"
                ><span class="pf">$ </span>npm i svelte-number-format</code
              >
              <button
                class="install-copy"
                class:copied={copiedKey === 'hero-install'}
                onclick={() =>
                  copy('hero-install', 'npm i svelte-number-format')}
                aria-label="Copy install command"
                >{copiedKey === 'hero-install' ? 'COPIED' : 'COPY'}</button
              >
            </div>
            <a href="#install" class="btn btn-primary">
              Quick start
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg
              >
            </a>
            <a
              href="https://github.com/pitis/svelte-number-format"
              class="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                ><path
                  d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.13c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a10.95 10.95 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
                /></svg
              >
              GitHub
            </a>
          </div>
        </div>

        <!-- Live playground -->
        <div class="playground" aria-label="Live playground">
          <div class="pg-tabs" role="tablist" aria-label="Playground demos">
            {#each [{ id: 'currency', label: 'Currency', kind: 'NUM' }, { id: 'percent', label: 'Percent', kind: 'NUM' }, { id: 'decimal', label: 'Decimal', kind: 'NUM' }, { id: 'phone', label: 'Phone', kind: 'PAT' }, { id: 'card', label: 'Card', kind: 'PAT' }] as t (t.id)}
              <button
                role="tab"
                aria-selected={pgTab === t.id}
                class="pg-tab"
                onclick={() => (pgTab = t.id as PgTab)}
              >
                {t.label}<span class="badge">{t.kind}</span>
              </button>
            {/each}
          </div>

          <div class="pg-body">
            <div class="pg-input-row">
              <div class="pg-label">
                <span>{pgIsNumeric ? 'NumericFormat' : 'PatternFormat'}</span>
                <span>{pgIsNumeric ? `${pgLocale} · ${pgTab}` : pgPattern}</span
                >
              </div>

              {#if pgTab === 'currency'}
                <NumericFormat
                  class="pg-input"
                  bind:value={pgCurrency}
                  locale={pgLocale}
                  options={{
                    formatStyle: NumberFormatStyle.Currency,
                    currency: pgCurrencyCode,
                    precision: pgPrecision
                  }}
                  placeholder="Enter a number"
                  aria-label="Currency input"
                />
              {:else if pgTab === 'percent'}
                <NumericFormat
                  class="pg-input"
                  bind:value={pgPercent}
                  locale={pgLocale}
                  options={{
                    formatStyle: NumberFormatStyle.Percent,
                    precision: pgPrecision
                  }}
                  placeholder="Enter a number"
                  aria-label="Percent input"
                />
              {:else if pgTab === 'decimal'}
                <NumericFormat
                  class="pg-input"
                  bind:value={pgDecimal}
                  locale={pgLocale}
                  options={{
                    formatStyle: NumberFormatStyle.Decimal,
                    precision: pgPrecision
                  }}
                  placeholder="Enter a number"
                  aria-label="Decimal input"
                />
              {:else if pgTab === 'phone'}
                <PatternFormat
                  class="pg-input"
                  bind:value={pgPhone}
                  format={MaskPatterns.PHONE_US}
                  placeholder={MaskPatterns.PHONE_US}
                  aria-label="Phone input"
                />
              {:else}
                <PatternFormat
                  class="pg-input"
                  bind:value={pgCard}
                  format={MaskPatterns.CREDIT_CARD}
                  placeholder={MaskPatterns.CREDIT_CARD}
                  aria-label="Credit card input"
                />
              {/if}
            </div>

            <div class="pg-readout">
              <span>display <b>{pgFormatted || '—'}</b></span>
              <span
                >raw <b>{pgRaw == null || pgRaw === '' ? '—' : pgRaw}</b></span
              >
            </div>

            <div class="pg-presets">
              {#each pgPresets as p (p.label)}
                <button class="pg-preset" onclick={p.apply}>{p.label}</button>
              {/each}
            </div>

            {#if pgIsNumeric}
              <div class="pg-controls">
                <div class="pg-ctl">
                  <span class="pg-label"><span>locale</span></span>
                  <select class="pg-select" bind:value={pgLocale}>
                    <option value="en-US">en-US</option>
                    <option value="de-DE">de-DE</option>
                    <option value="fr-FR">fr-FR</option>
                    <option value="ja-JP">ja-JP</option>
                    <option value="hi-IN">hi-IN</option>
                    <option value="pt-BR">pt-BR</option>
                  </select>
                </div>
                {#if pgTab === 'currency'}
                  <div class="pg-ctl">
                    <span class="pg-label"><span>currency</span></span>
                    <select class="pg-select" bind:value={pgCurrencyCode}>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>JPY</option>
                      <option>BRL</option>
                      <option>INR</option>
                    </select>
                  </div>
                  <div class="pg-ctl pg-ctl-full">
                    <span class="pg-label"><span>precision</span></span>
                    <div class="pg-segment" role="group">
                      {#each [0, 1, 2, 3, 4] as p (p)}
                        <button
                          aria-pressed={pgPrecision === p}
                          onclick={() => (pgPrecision = p)}>{p}</button
                        >
                      {/each}
                    </div>
                  </div>
                {:else}
                  <div class="pg-ctl">
                    <span class="pg-label"><span>precision</span></span>
                    <div class="pg-segment" role="group">
                      {#each [0, 1, 2, 3, 4] as p (p)}
                        <button
                          aria-pressed={pgPrecision === p}
                          onclick={() => (pgPrecision = p)}>{p}</button
                        >
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="stats">
        <div class="stats-row">
          <div class="stat">
            <div class="num">~8.1 kB</div>
            <div class="lbl">Bundle size · gzipped</div>
          </div>
          <div class="stat">
            <div class="num">4</div>
            <div class="lbl">Components</div>
          </div>
          <div class="stat">
            <div class="num">15+</div>
            <div class="lbl">Mask patterns</div>
          </div>
          <div class="stat">
            <div class="num">200+</div>
            <div class="lbl">Locales · Intl</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Features ────────────────────────────────────────────────────────── -->
  <section class="block" id="features">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">Features</div>
          <h2 class="section-title">
            Everything you need from a number input. Nothing you don't.
          </h2>
        </div>
        <p class="section-lead">
          Four components — <code class="mono">NumericFormat</code>,
          <code class="mono">PatternFormat</code>,
          <code class="mono">NumericText</code>, and
          <code class="mono">PatternText</code> — cover the entire surface. The rest
          is just options.
        </p>
      </div>
      <div class="features">
        {#each features as f (f.num)}
          <article class="feat">
            <div class="feat-num mono">{f.num}</div>
            <h3 class="feat-title">{f.title}</h3>
            <p class="feat-desc">{f.desc}</p>
            <div class="feat-glyph mono">{f.glyph}</div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Numeric showcase ────────────────────────────────────────────────── -->
  <section class="block" id="numeric">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">NumericFormat</div>
          <h2 class="section-title">
            Three styles. Every locale. Zero glue code.
          </h2>
        </div>
        <p class="section-lead">
          Pass a <code class="mono">formatStyle</code>, pick a precision, bind a
          value. The component takes care of grouping, separators, and currency
          symbols.
        </p>
      </div>

      <div class="showcase">
        <article class="showcard">
          <div class="showcard-hd">
            <span class="name mono">Currency</span>
            <span class="tag">USD</span>
          </div>
          <div class="showcard-body">
            <NumericFormat
              class="show-input"
              bind:value={showCurrency}
              locale="en-US"
              options={{
                formatStyle: NumberFormatStyle.Currency,
                currency: 'USD',
                precision: 2
              }}
            />
          </div>
          <div class="showcard-foot">
            <span>raw</span>
            <b class="tabular mono"
              >{showCurrency == null ? 'null' : showCurrency}</b
            >
          </div>
        </article>

        <article class="showcard">
          <div class="showcard-hd">
            <span class="name mono">Percent</span>
            <span class="tag">0–1</span>
          </div>
          <div class="showcard-body">
            <NumericFormat
              class="show-input"
              bind:value={showPercent}
              locale="en-US"
              options={{
                formatStyle: NumberFormatStyle.Percent,
                precision: 2
              }}
            />
          </div>
          <div class="showcard-foot">
            <span>raw</span>
            <b class="tabular mono"
              >{showPercent == null ? 'null' : showPercent}</b
            >
          </div>
        </article>

        <article class="showcard">
          <div class="showcard-hd">
            <span class="name mono">Decimal</span>
            <span class="tag">en-US</span>
          </div>
          <div class="showcard-body">
            <NumericFormat
              class="show-input"
              bind:value={showDecimal}
              locale="en-US"
              options={{
                formatStyle: NumberFormatStyle.Decimal,
                precision: 2
              }}
            />
          </div>
          <div class="showcard-foot">
            <span>raw</span>
            <b class="tabular mono"
              >{showDecimal == null ? 'null' : showDecimal}</b
            >
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- ── Pattern showcase ────────────────────────────────────────────────── -->
  <section class="block" id="pattern">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">PatternFormat</div>
          <h2 class="section-title">
            Masks for the inputs you build over and over.
          </h2>
        </div>
        <p class="section-lead">
          <code class="mono">#</code> for digits,
          <code class="mono">A</code> for letters,
          <code class="mono">*</code> for alphanumerics, anything else literal.
          15+ ready-made patterns from <code class="mono">MaskPatterns</code>.
        </p>
      </div>

      <div class="showcase showcase-3x2">
        {#each patternDemos as d (d.id)}
          <article class="showcard">
            <div class="showcard-hd">
              <span class="name mono">{d.name}</span>
              <span class="tag">{d.tag}</span>
            </div>
            <div class="showcard-body">
              <PatternFormat
                class="show-input"
                bind:value={patternValues[d.id]}
                format={d.pattern}
                placeholder={d.pattern}
                validate={d.validate}
              />
            </div>
            <div class="showcard-foot">
              <span>format <b class="mono">{d.pattern}</b></span>
              <span>raw <b class="mono">{patternValues[d.id] || '—'}</b></span>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Locale gallery ──────────────────────────────────────────────────── -->
  <section class="block" id="locales">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">Locales</div>
          <h2 class="section-title">
            One number. Eight locales. No string concatenation.
          </h2>
        </div>
        <div class="gallery-controls">
          <div class="pg-segment" role="group" aria-label="Format style">
            {#each ['decimal', 'currency', 'percent'] as s (s)}
              <button
                aria-pressed={galleryStyle === s}
                onclick={() => (galleryStyle = s as typeof galleryStyle)}
                >{s}</button
              >
            {/each}
          </div>
          <NumericFormat
            class="show-input gallery-input"
            bind:value={galleryNumber}
            locale="en-US"
            options={{
              formatStyle: NumberFormatStyle.Decimal,
              precision: 2
            }}
          />
        </div>
      </div>

      <div class="locale-grid">
        {#each locales as l (l.id)}
          <button
            class="loc"
            aria-pressed={galleryActive === l.id}
            onclick={() => (galleryActive = l.id)}
          >
            <div class="loc-flag">
              <span>{l.id}</span>
              <span class="loc-tag mono">{l.ccy}</span>
            </div>
            <div class="loc-value tabular">
              <NumericText
                value={galleryDisplayValue}
                locale={l.id}
                options={localeOptions(l.ccy)}
                fallback="—"
              />
            </div>
            <div class="loc-name">{l.name}</div>
            <div class="loc-row mono">
              <span>locale="{l.id}"</span><span aria-hidden="true">›</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Code examples ───────────────────────────────────────────────────── -->
  <section class="block" id="examples">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">Quick start</div>
          <h2 class="section-title">Two imports. One bind. Done.</h2>
        </div>
        <p class="section-lead">
          If you've used <code class="mono">react-number-format</code>, this
          will feel immediately familiar — without the React.
        </p>
      </div>
      <div class="examples-grid">
        {#each [codeCurrency, codePhone] as ex (ex.file)}
          <div class="code-shell">
            <div class="code-shell-hd">
              <div class="traffic" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
              <span class="file mono">{ex.file}</span>
              <button
                class="copy"
                class:copied={copiedKey === ex.file}
                onclick={() => copy(ex.file, ex.raw)}
                aria-label={`Copy ${ex.file}`}
                >{copiedKey === ex.file ? 'COPIED' : 'COPY'}</button
              >
            </div>
            <pre
              class="code"><!--
              -->{#each ex.lines as line, i (i)}<span
                  class="ln"
                  ><!--
                -->{#if line.length === 0}&nbsp;{:else}<!--
                  -->{#each line as tok, j (j)}<!--
                    -->{#if tok[1]}<span
                          class="tk-{tok[1]}">{tok[0]}</span
                        ><!--
                    -->{:else}{tok[0]}{/if}<!--
                  -->{/each}<!--
                -->{/if}<!--
              --></span
                >{/each}</pre>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Install / CTA ───────────────────────────────────────────────────── -->
  <!-- ── FAQ ─────────────────────────────────────────────────────────────── -->
  <section class="block" id="faq">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-kicker">FAQ</div>
          <h2 class="section-title">Questions, answered.</h2>
        </div>
        <p class="section-lead">
          The short versions. The
          <a
            class="link"
            href="https://github.com/pitis/svelte-number-format#readme"
            target="_blank"
            rel="noopener noreferrer">README</a
          > has the long ones, with code.
        </p>
      </div>
      <div class="faq-grid">
        {#each faq as f (f.q)}
          <article class="faq-item">
            <h3 class="faq-q">{f.q}</h3>
            <p class="faq-a">{f.a}</p>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="block" id="install">
    <div class="container">
      <div class="cta">
        <div>
          <div class="section-kicker">Install</div>
          <h3>Add it to your Svelte 5 project.</h3>
          <p>
            MIT licensed. ~8.1 kB gzipped. Zero config.
            <a
              class="link"
              href="https://github.com/pitis/svelte-number-format"
              target="_blank"
              rel="noopener noreferrer">Read the docs →</a
            >
          </p>
          <!-- eslint-disable svelte/no-navigation-without-resolve -->
          <p class="cta-demos">
            Live integration demos:
            <a href="{base}/demos/superforms/">Superforms</a>
            ·
            <a href="{base}/demos/formsnap/">Formsnap</a>
            ·
            <a href="{base}/demos/felte/">Felte</a>
            ·
            <a href="{base}/demos/zod/">Zod 3 × 4</a>
          </p>
          <!-- eslint-enable svelte/no-navigation-without-resolve -->
        </div>
        <div class="cta-right">
          <div class="pg-segment" role="group" aria-label="Package manager">
            {#each ['npm', 'pnpm', 'yarn', 'bun'] as x (x)}
              <button
                aria-pressed={pkgManager === x}
                onclick={() => (pkgManager = x as typeof pkgManager)}
                >{x}</button
              >
            {/each}
          </div>
          <div class="install" role="group" aria-label="Install command">
            <code class="install-cmd"
              ><span class="pf">$ </span>{installCmd}</code
            >
            <button
              class="install-copy"
              class:copied={copiedKey === 'cta-install'}
              onclick={() => copy('cta-install', installCmd)}
              aria-label="Copy install command"
              >{copiedKey === 'cta-install' ? 'COPIED' : 'COPY'}</button
            >
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Footer ──────────────────────────────────────────────────────────── -->
  <footer class="foot">
    <div class="container">
      <div class="foot-grid">
        <div class="foot-brand">
          <a href="#top" class="brand">
            <span class="brand-mark">#</span>
            <span>svelte-number-format</span>
          </a>
          <p>
            A lightweight, reactive input component library for Svelte 5.
            Inspired by react-number-format.
          </p>
        </div>
        <div class="foot-col">
          <h5>Package</h5>
          <ul>
            <li>
              <a
                href="https://www.npmjs.com/package/svelte-number-format"
                target="_blank"
                rel="noopener noreferrer">npm</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pitis/svelte-number-format"
                target="_blank"
                rel="noopener noreferrer">GitHub</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pitis/svelte-number-format/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer">Docs</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pitis/svelte-number-format/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer">Changelog</a
              >
            </li>
          </ul>
        </div>
        <div class="foot-col">
          <h5>Components</h5>
          <ul>
            <li><a href="#numeric">NumericFormat</a></li>
            <li><a href="#pattern">PatternFormat</a></li>
            <li><a href="#locales">Locales</a></li>
            <li><a href="#examples">Examples</a></li>
          </ul>
        </div>
        <div class="foot-col">
          <h5>Community</h5>
          <ul>
            <li>
              <a
                href="https://github.com/pitis/svelte-number-format/issues"
                target="_blank"
                rel="noopener noreferrer">Issues</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pitis/svelte-number-format/blob/main/MIGRATION.md"
                target="_blank"
                rel="noopener noreferrer">Migration guide</a
              >
            </li>
            <li>
              <a
                href="https://github.com/sponsors/pitis"
                target="_blank"
                rel="noopener noreferrer">Sponsor</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pitis/svelte-number-format/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer">License</a
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom mono">
        <span>MIT · v{VERSION}</span>
        <span>Made with Svelte 5 · built on intl-number-input</span>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(:root) {
    --font-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif;
    --font-mono: 'Geist Mono', ui-monospace, 'SFMono-Regular', monospace;

    --bg: #ffffff;
    --bg-soft: #fafafa;
    --bg-sunken: #f4f4f4;
    --fg: #0a0a0a;
    --fg-muted: #6b6b6b;
    --fg-faint: #a3a3a3;
    --line: rgba(10, 10, 10, 0.08);
    --line-strong: rgba(10, 10, 10, 0.14);
    --accent: #ff3e00;
    --accent-soft: rgba(255, 62, 0, 0.08);

    --radius: 10px;
    --radius-lg: 14px;
  }

  :global(html[data-theme='dark']) {
    --bg: #0a0a0a;
    --bg-soft: #111111;
    --bg-sunken: #161616;
    --fg: #fafafa;
    --fg-muted: #9a9a9a;
    --fg-faint: #5a5a5a;
    --line: rgba(255, 255, 255, 0.08);
    --line-strong: rgba(255, 255, 255, 0.14);
    --accent-soft: rgba(255, 62, 0, 0.14);
  }

  :global(*) {
    box-sizing: border-box;
  }
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
  }
  :global(body) {
    color: var(--fg);
    font-family: var(--font-sans);
    font-feature-settings: 'ss01', 'cv11';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 15px;
    line-height: 1.5;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }
  :global(html) {
    scroll-behavior: smooth;
  }
  :global(::selection) {
    background: var(--accent);
    color: #fff;
  }

  .page {
    background: var(--bg);
    color: var(--fg);
    min-height: 100vh;
  }

  .mono {
    font-family: var(--font-mono);
  }
  .tabular {
    font-variant-numeric: tabular-nums;
  }

  /* Top nav */
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    background: color-mix(in srgb, var(--bg) 72%, transparent);
    border-bottom: 1px solid var(--line);
  }
  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: inherit;
    text-decoration: none;
  }
  .brand-mark {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--fg);
    color: var(--bg);
    display: grid;
    place-items: center;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 12px;
  }
  .nav-version {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--fg-muted);
    padding: 3px 7px;
    border-radius: 5px;
    border: 1px solid var(--line);
  }
  .nav-links {
    display: flex;
    gap: 22px;
    margin-left: auto;
    align-items: center;
  }
  .nav-link {
    color: var(--fg-muted);
    font-size: 13.5px;
    transition: color 0.15s ease;
    text-decoration: none;
  }
  .nav-link:hover {
    color: var(--fg);
  }
  @media (max-width: 720px) {
    .nav-link {
      display: none;
    }
    .nav-version {
      display: none;
    }
  }
  .icon-btn {
    appearance: none;
    background: transparent;
    border: 1px solid var(--line);
    color: var(--fg);
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }
  .icon-btn:hover {
    background: var(--bg-soft);
    border-color: var(--line-strong);
  }

  /* Layout */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 28px;
  }

  /* Hero */
  .hero {
    padding: 88px 0 72px;
    position: relative;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: 72px;
    align-items: start;
  }
  @media (max-width: 940px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 48px;
    }
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--fg-muted);
    padding: 5px 10px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--bg-soft);
    margin-bottom: 22px;
  }
  .eyebrow .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  h1.hero-title {
    font-size: clamp(44px, 6.4vw, 76px);
    line-height: 0.98;
    letter-spacing: -0.035em;
    font-weight: 600;
    margin: 0 0 22px;
    text-wrap: balance;
  }
  .hero-title em {
    font-style: normal;
    color: var(--fg-muted);
  }
  .hero-sub {
    font-size: 18px;
    color: var(--fg-muted);
    max-width: 46ch;
    margin: 0 0 32px;
    line-height: 1.55;
    text-wrap: pretty;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn {
    appearance: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    font: inherit;
    font-weight: 500;
    font-size: 14px;
    border: 1px solid transparent;
    text-decoration: none;
    transition:
      transform 0.08s ease,
      background 0.15s ease,
      border-color 0.15s ease;
  }
  .btn:active {
    transform: translateY(1px);
  }
  .btn-primary {
    background: var(--fg);
    color: var(--bg);
  }
  .btn-primary:hover {
    background: color-mix(in srgb, var(--fg) 88%, var(--accent));
  }
  .btn-ghost {
    background: transparent;
    color: var(--fg);
    border-color: var(--line-strong);
  }
  .btn-ghost:hover {
    background: var(--bg-soft);
  }

  .install {
    display: inline-flex;
    align-items: stretch;
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 13px;
    background: var(--bg-soft);
  }
  .install-cmd {
    padding: 10px 14px;
    color: var(--fg);
    white-space: nowrap;
  }
  .install-cmd .pf {
    color: var(--fg-faint);
    user-select: none;
  }
  .install-copy {
    appearance: none;
    border: 0;
    border-left: 1px solid var(--line);
    background: transparent;
    color: var(--fg-muted);
    padding: 0 12px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 12px;
    transition:
      color 0.15s ease,
      background 0.15s ease;
  }
  .install-copy:hover {
    color: var(--fg);
    background: var(--bg-sunken);
  }
  .install-copy.copied {
    color: var(--accent);
  }

  /* Hero playground */
  .playground {
    position: relative;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg-soft);
    overflow: hidden;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.04) inset,
      0 24px 60px -30px rgba(0, 0, 0, 0.35);
  }
  :global(html[data-theme='dark']) .playground {
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.04) inset,
      0 24px 60px -30px rgba(0, 0, 0, 0.7);
  }
  .pg-tabs {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--line);
    background: var(--bg);
    padding: 0 8px;
    gap: 0;
    overflow-x: auto;
  }
  .pg-tab {
    appearance: none;
    border: 0;
    background: transparent;
    font: inherit;
    font-size: 12.5px;
    color: var(--fg-muted);
    padding: 12px 14px;
    cursor: pointer;
    border-bottom: 1.5px solid transparent;
    margin-bottom: -1px;
    font-family: var(--font-mono);
    letter-spacing: 0.01em;
    white-space: nowrap;
    transition:
      color 0.15s ease,
      border-color 0.15s ease;
  }
  .pg-tab:hover {
    color: var(--fg);
  }
  .pg-tab[aria-selected='true'] {
    color: var(--fg);
    border-bottom-color: var(--accent);
  }
  .pg-tab .badge {
    display: inline-block;
    margin-left: 6px;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--bg-sunken);
    color: var(--fg-faint);
    border: 1px solid var(--line);
  }
  .pg-body {
    padding: 28px;
  }
  .pg-input-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pg-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-faint);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  :global(.pg-input) {
    appearance: none;
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    padding: 16px 18px;
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 500;
    color: var(--fg);
    outline: none;
    font-variant-numeric: tabular-nums;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }
  :global(.pg-input:focus) {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-soft);
  }
  :global(.pg-input::placeholder) {
    color: var(--fg-faint);
  }

  .pg-readout {
    margin-top: 14px;
    padding: 12px 14px;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: var(--fg-muted);
  }
  .pg-readout b {
    color: var(--fg);
    font-weight: 500;
  }

  .pg-controls {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 16px;
  }
  .pg-ctl {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pg-ctl-full {
    grid-column: 1 / -1;
  }
  .pg-select {
    appearance: none;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 9px 12px;
    font: inherit;
    font-size: 13px;
    font-family: var(--font-mono);
    color: var(--fg);
    outline: none;
    cursor: pointer;
  }
  .pg-select:focus {
    border-color: var(--line-strong);
  }

  .pg-segment {
    display: inline-flex;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }
  .pg-segment button {
    appearance: none;
    border: 0;
    background: transparent;
    font: inherit;
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 6px;
    color: var(--fg-muted);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }
  .pg-segment button:hover {
    color: var(--fg);
  }
  .pg-segment button[aria-pressed='true'] {
    background: var(--bg-sunken);
    color: var(--fg);
  }

  .pg-presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 14px;
  }
  .pg-preset {
    appearance: none;
    cursor: pointer;
    background: var(--bg);
    border: 1px solid var(--line);
    color: var(--fg-muted);
    font-family: var(--font-mono);
    font-size: 11.5px;
    padding: 5px 10px;
    border-radius: 999px;
    transition:
      color 0.15s ease,
      border-color 0.15s ease;
  }
  .pg-preset:hover {
    color: var(--fg);
    border-color: var(--line-strong);
  }

  /* Stats strip */
  .stats {
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    padding: 24px 0;
    margin-top: 64px;
  }
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  @media (max-width: 760px) {
    .stats-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .stat .num {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .stat .lbl {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 4px;
  }

  /* Section heading */
  section.block {
    padding: 96px 0;
    border-bottom: 1px solid var(--line);
  }
  section.block:last-of-type {
    border-bottom: 0;
  }
  .section-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 48px;
    flex-wrap: wrap;
  }
  .section-kicker {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--fg-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-kicker::before {
    content: '';
    display: inline-block;
    width: 14px;
    height: 1px;
    background: var(--fg-faint);
  }
  h2.section-title {
    font-size: clamp(32px, 4vw, 48px);
    letter-spacing: -0.025em;
    font-weight: 600;
    margin: 0;
    line-height: 1.05;
    text-wrap: balance;
    max-width: 18ch;
  }
  .section-lead {
    color: var(--fg-muted);
    font-size: 17px;
    max-width: 38ch;
    margin: 0;
    line-height: 1.5;
  }
  .section-lead code {
    font-family: var(--font-mono);
  }

  /* FAQ */
  .faq-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-soft);
  }
  .faq-item {
    padding: 26px 28px;
    border-bottom: 1px solid var(--line);
  }
  .faq-item:nth-child(odd) {
    border-right: 1px solid var(--line);
  }
  .faq-item:nth-last-child(-n + 2) {
    border-bottom: 0;
  }
  .faq-q {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .faq-a {
    margin: 0;
    color: var(--fg-muted);
    font-size: 14.5px;
    line-height: 1.6;
  }
  @media (max-width: 720px) {
    .faq-grid {
      grid-template-columns: 1fr;
    }
    .faq-item:nth-child(odd) {
      border-right: 0;
    }
    .faq-item:nth-last-child(-n + 2) {
      border-bottom: 1px solid var(--line);
    }
    .faq-item:last-child {
      border-bottom: 0;
    }
  }

  /* Features grid */
  .features {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-soft);
  }
  @media (max-width: 940px) {
    .features {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 560px) {
    .features {
      grid-template-columns: 1fr;
    }
  }
  .feat {
    padding: 28px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: var(--bg);
    position: relative;
  }
  .feat:nth-child(4n) {
    border-right: 0;
  }
  .features > .feat:nth-last-child(-n + 4) {
    border-bottom: 0;
  }
  @media (max-width: 940px) {
    .feat {
      border-right: 1px solid var(--line) !important;
      border-bottom: 1px solid var(--line) !important;
    }
    .feat:nth-child(2n) {
      border-right: 0 !important;
    }
    .features > .feat:nth-last-child(-n + 2) {
      border-bottom: 0 !important;
    }
  }
  @media (max-width: 560px) {
    .feat {
      border-right: 0 !important;
    }
  }
  .feat-num {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-faint);
  }
  .feat-title {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin: 16px 0 8px;
  }
  .feat-desc {
    color: var(--fg-muted);
    font-size: 14px;
    line-height: 1.55;
    margin: 0;
  }
  .feat-glyph {
    margin-top: 22px;
    height: 56px;
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--fg);
  }

  /* Showcase rows */
  .showcase {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .showcase-3x2 {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 940px) {
    .showcase {
      grid-template-columns: 1fr;
    }
    .showcase-3x2 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 560px) {
    .showcase-3x2 {
      grid-template-columns: 1fr;
    }
  }
  .showcard {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg-soft);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .showcard-hd {
    padding: 16px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg);
  }
  .showcard-hd .name {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
  }
  .showcard-hd .tag {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--fg-faint);
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid var(--line);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .showcard-body {
    padding: 22px 18px;
  }
  .showcard-foot {
    margin-top: auto;
    border-top: 1px solid var(--line);
    padding: 12px 18px;
    background: var(--bg);
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--fg-muted);
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .showcard-foot b {
    color: var(--fg);
    font-weight: 500;
  }
  :global(.show-input) {
    appearance: none;
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 12px 14px;
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--fg);
    outline: none;
    font-variant-numeric: tabular-nums;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }
  :global(.show-input:focus) {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  /* Validation states (CPF card) — the library sets data-valid */
  :global(.show-input[data-valid='true']) {
    border-color: #22c55e;
  }
  :global(.show-input[data-valid='false']) {
    border-color: #ef4444;
  }

  /* Locale gallery */
  .gallery-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  :global(.gallery-input) {
    width: 280px !important;
    max-width: 100%;
  }
  .locale-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  @media (max-width: 940px) {
    .locale-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .loc {
    padding: 28px;
    background: var(--bg-soft);
    border: 0;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    color: inherit;
    font: inherit;
    transition: background 0.15s ease;
  }
  .loc:hover {
    background: var(--bg);
  }
  .loc[aria-pressed='true'] {
    background: var(--bg);
  }
  .loc[aria-pressed='true'] .loc-tag {
    color: var(--accent);
    border-color: var(--accent);
  }
  .locale-grid > .loc:nth-child(4n) {
    border-right: 0;
  }
  .locale-grid > .loc:nth-last-child(-n + 4) {
    border-bottom: 0;
  }
  @media (max-width: 940px) {
    .loc {
      border-right: 1px solid var(--line) !important;
      border-bottom: 1px solid var(--line) !important;
    }
    .loc:nth-child(2n) {
      border-right: 0 !important;
    }
    .locale-grid > .loc:nth-last-child(-n + 2) {
      border-bottom: 0 !important;
    }
  }
  .loc-flag {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-faint);
    letter-spacing: 0.04em;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .loc-tag {
    font-family: var(--font-mono);
    font-size: 10.5px;
    border: 1px solid var(--line);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--fg-faint);
  }
  .loc-value {
    font-size: clamp(22px, 2.4vw, 30px);
    font-weight: 500;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }
  .loc-name {
    font-size: 13px;
    color: var(--fg-muted);
  }
  .loc-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-faint);
  }

  /* Code block */
  .code-shell {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg-soft);
    overflow: hidden;
  }
  .code-shell-hd {
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    background: var(--bg);
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-muted);
  }
  .code-shell-hd .traffic {
    display: flex;
    gap: 6px;
  }
  .code-shell-hd .traffic span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--bg-sunken);
    border: 1px solid var(--line);
  }
  .code-shell-hd .file {
    color: var(--fg);
  }
  .code-shell-hd .copy {
    margin-left: auto;
    appearance: none;
    border: 1px solid var(--line);
    background: var(--bg-soft);
    color: var(--fg-muted);
    font: inherit;
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 5px;
    cursor: pointer;
    transition:
      color 0.15s ease,
      border-color 0.15s ease;
  }
  .code-shell-hd .copy:hover {
    color: var(--fg);
    border-color: var(--line-strong);
  }
  .code-shell-hd .copy.copied {
    color: var(--accent);
    border-color: var(--accent);
  }
  pre.code {
    margin: 0;
    padding: 22px 22px 22px 0;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.7;
    overflow-x: auto;
    counter-reset: line;
  }
  pre.code .ln {
    display: block;
    padding-left: 60px;
    position: relative;
    white-space: pre;
    min-height: 1.7em;
  }
  pre.code .ln::before {
    counter-increment: line;
    content: counter(line);
    position: absolute;
    left: 0;
    width: 44px;
    text-align: right;
    padding-right: 14px;
    color: var(--fg-faint);
    font-size: 11.5px;
    user-select: none;
  }
  pre.code :global(.tk-key) {
    color: #af3df0;
  }
  pre.code :global(.tk-tag) {
    color: #0f7c66;
  }
  pre.code :global(.tk-attr) {
    color: #b14a00;
  }
  pre.code :global(.tk-str) {
    color: #1a7e3e;
  }
  pre.code :global(.tk-num) {
    color: #6b5dd0;
  }
  pre.code :global(.tk-com) {
    color: var(--fg-faint);
    font-style: italic;
  }
  pre.code :global(.tk-fn) {
    color: #1064c2;
  }
  pre.code :global(.tk-pun) {
    color: var(--fg-muted);
  }
  :global(html[data-theme='dark']) pre.code :global(.tk-key) {
    color: #c594ff;
  }
  :global(html[data-theme='dark']) pre.code :global(.tk-tag) {
    color: #5fd9bf;
  }
  :global(html[data-theme='dark']) pre.code :global(.tk-attr) {
    color: #ffb86b;
  }
  :global(html[data-theme='dark']) pre.code :global(.tk-str) {
    color: #7adf95;
  }
  :global(html[data-theme='dark']) pre.code :global(.tk-num) {
    color: #a89dff;
  }
  :global(html[data-theme='dark']) pre.code :global(.tk-fn) {
    color: #6cb8ff;
  }

  .examples-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  @media (max-width: 940px) {
    .examples-grid {
      grid-template-columns: 1fr;
    }
  }

  /* CTA / install block */
  .cta {
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-lg);
    padding: 56px 48px;
    background: var(--bg-soft);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 32px;
    align-items: center;
  }
  @media (max-width: 760px) {
    .cta {
      grid-template-columns: 1fr;
      padding: 36px 28px;
    }
  }
  .cta h3 {
    margin: 0 0 8px;
    font-size: clamp(28px, 3.4vw, 40px);
    letter-spacing: -0.025em;
    font-weight: 600;
    line-height: 1.05;
  }
  .cta p {
    margin: 0;
    color: var(--fg-muted);
  }
  .cta .link {
    color: var(--fg);
    border-bottom: 1px solid var(--line-strong);
    text-decoration: none;
  }
  .cta .link:hover {
    border-bottom-color: var(--accent);
  }
  .cta-demos {
    margin-top: 14px !important;
    font-size: 13.5px;
    font-family: var(--font-mono);
  }
  .cta-demos a {
    color: var(--fg);
    text-decoration: none;
    border-bottom: 1px dotted var(--line-strong);
  }
  .cta-demos a:hover {
    border-bottom-color: var(--accent);
  }
  .cta-right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
  }
  @media (max-width: 760px) {
    .cta-right {
      align-items: flex-start;
    }
  }

  /* Footer */
  footer.foot {
    border-top: 1px solid var(--line);
    padding: 56px 0 40px;
    background: var(--bg);
  }
  .foot-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
  }
  @media (max-width: 760px) {
    .foot-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .foot-brand {
    max-width: 32ch;
  }
  .foot-brand p {
    color: var(--fg-muted);
    margin: 12px 0 0;
    font-size: 14px;
  }
  .foot-col h5 {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-faint);
    margin: 0 0 14px;
    font-weight: 500;
  }
  .foot-col ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .foot-col a {
    color: var(--fg-muted);
    font-size: 13.5px;
    text-decoration: none;
  }
  .foot-col a:hover {
    color: var(--fg);
  }
  .foot-bottom {
    margin-top: 56px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--fg-faint);
    flex-wrap: wrap;
    gap: 12px;
  }
</style>

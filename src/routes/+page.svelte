<script lang="ts">
  import {
    NumericFormat,
    PatternFormat,
    NumericText,
    PatternText,
    NumberFormatStyle,
    MaskPatterns,
    type NumberFormatValues
  } from '../lib/index.js'

  // Numeric demos
  let amountBasic = $state<number | null>(1234.56)
  let priceCurrency = $state<number | null>(9999.99)
  let euroAmount = $state<number | null>(1234.56)
  let percentage = $state<number | null>(0.75)
  let amountWithRange = $state<number | null>(500)
  let priceAutoDecimal = $state<number | null>(99.99)
  let lastValueChange = $state<NumberFormatValues | null>(null)

  // Pattern demos
  let phoneNumber = $state<string | null>('4155551234')
  let phoneInternational = $state<string | null>(null)
  let creditCard = $state<string | null>(null)
  let dateInput = $state<string | null>('12252026')
  let ssnInput = $state<string | null>(null)
  let hexColor = $state<string | null>('ff6a3d')
  let binaryInput = $state<string | null>(null)
  let phoneAllowEmpty = $state<string | null>(null)

  // Display demos
  const displayTableRows = [
    { label: 'Base rate', value: 1485.0, currency: 'USD' },
    { label: 'European', value: 2310.5, currency: 'EUR', locale: 'de-DE' },
    { label: 'Yen', value: 199800, currency: 'JPY', locale: 'ja-JP' },
    { label: 'Swiss', value: 819.25, currency: 'CHF', locale: 'de-CH' }
  ]

  let darkMode = $state(false)

  $effect(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      darkMode = stored === 'true'
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })

  $effect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(darkMode))
  })

  const today = new Date()
  const issueLabel = `${today.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${today.getFullYear()}`

  function handleValueChange(values: NumberFormatValues) {
    lastValueChange = values
  }
</script>

<svelte:head>
  <title>svelte-number-format · specimen sheet</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,0..100&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=JetBrains+Mono:wght@300;400;500;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="sheet">
  <div class="grain" aria-hidden="true"></div>

  <header class="hero">
    <div class="hero-top">
      <div class="dateline">
        <span class="dateline-part">SVF — 01</span>
        <span class="dateline-sep">·</span>
        <span class="dateline-part">VOL I</span>
        <span class="dateline-sep">·</span>
        <span class="dateline-part">{issueLabel}</span>
        <span class="dateline-sep">·</span>
        <span class="dateline-part">A SPECIMEN SHEET</span>
      </div>

      <button
        type="button"
        class="mode-toggle"
        onclick={() => (darkMode = !darkMode)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span class="mode-toggle-label">
          {darkMode ? 'NIGHT EDITION' : 'DAY EDITION'}
        </span>
        <span class="mode-toggle-dot" aria-hidden="true"></span>
      </button>
    </div>

    <div class="hero-body">
      <h1 class="wordmark">
        <span class="wordmark-line">svelte<span class="dash">-</span></span>
        <span class="wordmark-line">number<span class="dash">-</span></span>
        <span class="wordmark-line">
          format
          <sup class="wordmark-sup">v1.2</sup>
        </span>
      </h1>

      <div class="hero-lede">
        <p class="strapline">
          Two inputs, two readouts, and a Swiss-army knife of mask tokens.
          <em
            >Locale-aware formatting, pattern masking, caret stability, paste
            handling, a11y, SSR.</em
          >
          <span class="svelte-mark">Svelte 5 only.</span>
        </p>

        <p class="standfirst-p">
          <span class="drop">T</span>he quiet library you reach for when the
          field has to be <em>correct</em>. A phone number that rewrites as you
          type. A currency amount that respects its locale. A social security
          number that paste-cleans itself. Two components do the work, two
          components render the result. The whole thing ships under four
          kilobytes gzipped.
        </p>
      </div>
    </div>
  </header>

  <!-- §01 — NUMERIC SPECIMENS -->
  <section class="specimens">
    <header class="section-head">
      <span class="section-no">§ 01</span>
      <h2 class="section-title">Numeric specimens</h2>
      <span class="section-rule" aria-hidden="true"></span>
      <span class="section-desc">
        Locale-aware via <code>Intl.NumberFormat</code>
      </span>
    </header>

    <div class="spec-grid">
      <article class="spec spec--half" style="--delay: 0ms">
        <div class="spec-meta">
          <span class="serial">No. 01</span>
          <span class="tag">PLAIN · PRECISION 2</span>
        </div>
        <div class="spec-field">
          <NumericFormat
            bind:value={amountBasic}
            options={{ precision: 2 }}
            placeholder="0.00"
            aria-label="Plain numeric input"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <span class="readout-label">bound value</span>
          <code class="readout-code">{amountBasic ?? 'null'}</code>
        </div>
      </article>

      <article class="spec spec--quarter" style="--delay: 60ms">
        <div class="spec-meta">
          <span class="serial">No. 02</span>
          <span class="tag">USD · en-US</span>
        </div>
        <div class="spec-field">
          <NumericFormat
            bind:value={priceCurrency}
            locale="en-US"
            options={{
              formatStyle: NumberFormatStyle.Currency,
              currency: 'USD',
              precision: 2
            }}
            placeholder="$0.00"
            aria-label="USD price"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{priceCurrency ?? 'null'}</code>
        </div>
      </article>

      <article class="spec spec--quarter" style="--delay: 120ms">
        <div class="spec-meta">
          <span class="serial">No. 03</span>
          <span class="tag">EUR · de-DE</span>
        </div>
        <div class="spec-field">
          <NumericFormat
            bind:value={euroAmount}
            locale="de-DE"
            options={{
              formatStyle: NumberFormatStyle.Currency,
              currency: 'EUR',
              precision: 2
            }}
            placeholder="0,00 €"
            aria-label="EUR price"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{euroAmount ?? 'null'}</code>
        </div>
      </article>

      <article class="spec spec--quarter" style="--delay: 180ms">
        <div class="spec-meta">
          <span class="serial">No. 04</span>
          <span class="tag">PERCENT · 0–1</span>
        </div>
        <div class="spec-field">
          <NumericFormat
            bind:value={percentage}
            locale="en-US"
            options={{
              formatStyle: NumberFormatStyle.Percent,
              precision: 2
            }}
            placeholder="0%"
            aria-label="Percentage"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{percentage ?? 'null'}</code>
          <span class="readout-aside">stored as decimal</span>
        </div>
      </article>

      <article class="spec spec--quarter" style="--delay: 240ms">
        <div class="spec-meta">
          <span class="serial">No. 05</span>
          <span class="tag">RANGE · 0–1000</span>
        </div>
        <div class="spec-field">
          <NumericFormat
            bind:value={amountWithRange}
            options={{
              precision: 2,
              valueRange: { min: 0, max: 1000 }
            }}
            placeholder="0.00"
            aria-label="Ranged amount"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{amountWithRange ?? 'null'}</code>
          <span class="readout-aside">clamped on blur</span>
        </div>
      </article>

      <article class="spec spec--half" style="--delay: 300ms">
        <div class="spec-meta">
          <span class="serial">No. 06</span>
          <span class="tag">AUTO-DECIMAL</span>
        </div>
        <div class="spec-field">
          <NumericFormat
            bind:value={priceAutoDecimal}
            options={{
              precision: 2,
              autoDecimalDigits: true
            }}
            placeholder="type 1234 → 12.34"
            aria-label="Auto decimal"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{priceAutoDecimal ?? 'null'}</code>
        </div>
      </article>

      <article class="spec spec--full" style="--delay: 360ms">
        <div class="spec-meta">
          <span class="serial">No. 07</span>
          <span class="tag">onValueChange — rich payload</span>
        </div>
        <div class="spec-field">
          <NumericFormat
            value={1999.99}
            options={{
              formatStyle: NumberFormatStyle.Currency,
              currency: 'USD',
              precision: 2
            }}
            onValueChange={handleValueChange}
            aria-label="Payload demo"
            class="num-input"
          />
        </div>
        <table class="payload">
          <tbody>
            <tr>
              <th>floatValue</th>
              <td>
                <code>
                  {lastValueChange?.floatValue ?? '—'}
                </code>
              </td>
            </tr>
            <tr>
              <th>formattedValue</th>
              <td>
                <code>{lastValueChange?.formattedValue || '—'}</code>
              </td>
            </tr>
            <tr>
              <th>value</th>
              <td>
                <code>{lastValueChange?.value || '—'}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </section>

  <!-- §02 — PATTERN SPECIMENS -->
  <section class="specimens">
    <header class="section-head">
      <span class="section-no">§ 02</span>
      <h2 class="section-title">Pattern specimens</h2>
      <span class="section-rule" aria-hidden="true"></span>
      <span class="section-desc">
        Mask tokens: <code>#</code> digit · <code>A</code> letter ·
        <code>*</code> alphanumeric
      </span>
    </header>

    <div class="spec-grid">
      <article class="spec" style="--delay: 0ms">
        <div class="spec-meta">
          <span class="serial">No. 08</span>
          <span class="tag">US PHONE · try pasting</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={phoneNumber}
            format={MaskPatterns.PHONE_US}
            placeholder="(···) ···-····"
            aria-label="US phone number"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{phoneNumber ?? 'null'}</code>
          <span class="readout-aside">(###) ###-####</span>
        </div>
      </article>

      <article class="spec" style="--delay: 60ms">
        <div class="spec-meta">
          <span class="serial">No. 09</span>
          <span class="tag">INTL PHONE</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={phoneInternational}
            format={MaskPatterns.PHONE_INTERNATIONAL}
            aria-label="International phone"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{phoneInternational ?? 'null'}</code>
        </div>
      </article>

      <article class="spec" style="--delay: 120ms">
        <div class="spec-meta">
          <span class="serial">No. 10</span>
          <span class="tag">CARD · generic</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={creditCard}
            format={MaskPatterns.CREDIT_CARD}
            aria-label="Credit card number"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{creditCard ?? 'null'}</code>
        </div>
      </article>

      <article class="spec" style="--delay: 180ms">
        <div class="spec-meta">
          <span class="serial">No. 11</span>
          <span class="tag">DATE · MM/DD/YYYY</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={dateInput}
            format={MaskPatterns.DATE_US}
            aria-label="US date"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{dateInput ?? 'null'}</code>
        </div>
      </article>

      <article class="spec" style="--delay: 240ms">
        <div class="spec-meta">
          <span class="serial">No. 12</span>
          <span class="tag">SSN</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={ssnInput}
            format={MaskPatterns.SSN}
            aria-label="Social security"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{ssnInput ?? 'null'}</code>
        </div>
      </article>

      <article class="spec" style="--delay: 300ms">
        <div class="spec-meta">
          <span class="serial">No. 13</span>
          <span class="tag">CUSTOM · hex colour</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={hexColor}
            format="HHHHHH"
            customPatterns={{ H: /[0-9a-fA-F]/ }}
            placeholder="ff00aa"
            aria-label="Hex colour"
            class="num-input"
          />
        </div>
        <div class="spec-readout spec-readout--swatch">
          <span
            class="swatch"
            style="background: {hexColor && hexColor.length === 6
              ? '#' + hexColor
              : 'transparent'}"
            aria-hidden="true"
          ></span>
          <code class="readout-code">
            {hexColor ? '#' + hexColor : 'null'}
          </code>
        </div>
      </article>

      <article class="spec" style="--delay: 360ms">
        <div class="spec-meta">
          <span class="serial">No. 14</span>
          <span class="tag">CUSTOM · binary</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={binaryInput}
            format="BBBB BBBB"
            customPatterns={{ B: /[01]/ }}
            placeholder="0000 0000"
            aria-label="Binary byte"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{binaryInput ?? 'null'}</code>
          <span class="readout-aside">
            {binaryInput && binaryInput.length === 8
              ? 'dec ' + parseInt(binaryInput, 2)
              : ''}
          </span>
        </div>
      </article>

      <article class="spec spec--twothirds" style="--delay: 420ms">
        <div class="spec-meta">
          <span class="serial">No. 15</span>
          <span class="tag">allowEmptyFormatting · skeleton before typing</span>
        </div>
        <div class="spec-field">
          <PatternFormat
            bind:value={phoneAllowEmpty}
            format={MaskPatterns.PHONE_US}
            allowEmptyFormatting
            aria-label="Phone with skeleton"
            class="num-input"
          />
        </div>
        <div class="spec-readout">
          <span class="readout-arrow">↳</span>
          <code class="readout-code">{phoneAllowEmpty ?? 'null'}</code>
          <span class="readout-aside">
            caret lands at first fillable slot on focus
          </span>
        </div>
      </article>
    </div>
  </section>

  <!-- §03 — DISPLAY SPECIMENS -->
  <section class="specimens">
    <header class="section-head">
      <span class="section-no">§ 03</span>
      <h2 class="section-title">Read-only displays</h2>
      <span class="section-rule" aria-hidden="true"></span>
      <span class="section-desc">
        <code>NumericText</code> and <code>PatternText</code> — no input, just render
      </span>
    </header>

    <table class="ledger">
      <thead>
        <tr>
          <th class="col-label">Line item</th>
          <th class="col-money">Amount (locale)</th>
          <th class="col-raw">Raw</th>
        </tr>
      </thead>
      <tbody>
        {#each displayTableRows as row, i (row.label)}
          <tr style="--delay: {i * 50}ms">
            <td class="col-label">{row.label}</td>
            <td class="col-money">
              <NumericText
                value={row.value}
                locale={row.locale ?? 'en-US'}
                options={{
                  formatStyle: NumberFormatStyle.Currency,
                  currency: row.currency,
                  precision: row.currency === 'JPY' ? 0 : 2
                }}
              />
            </td>
            <td class="col-raw"><code>{row.value}</code></td>
          </tr>
        {/each}
        <tr class="ledger-divider">
          <td colspan="3"></td>
        </tr>
        <tr>
          <td class="col-label">
            Phone <em>— PatternText</em>
          </td>
          <td class="col-money col-money--left">
            <PatternText
              value={phoneNumber}
              format={MaskPatterns.PHONE_US}
              fallback="—"
            />
          </td>
          <td class="col-raw">
            <code>{phoneNumber ?? 'null'}</code>
          </td>
        </tr>
        <tr>
          <td class="col-label">
            Date <em>— PatternText</em>
          </td>
          <td class="col-money col-money--left">
            <PatternText
              value={dateInput}
              format={MaskPatterns.DATE_US}
              fallback="—"
            />
          </td>
          <td class="col-raw"><code>{dateInput ?? 'null'}</code></td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- §04 — INSTALLATION / CODE -->
  <section class="specimens">
    <header class="section-head">
      <span class="section-no">§ 04</span>
      <h2 class="section-title">Bring your own typography</h2>
      <span class="section-rule" aria-hidden="true"></span>
      <span class="section-desc">
        Four lines of npm, one import, one component
      </span>
    </header>

    <div class="code-grid">
      <div class="code-block">
        <div class="code-label">install</div>
        <pre><code>npm install svelte-number-format</code></pre>
      </div>
      <div class="code-block">
        <div class="code-label">import (tree-shaken subpath)</div>
        <pre><code
            >import &#123; NumericFormat &#125; from 'svelte-number-format/numeric'
import &#123; PatternFormat &#125; from 'svelte-number-format/pattern'</code
          ></pre>
      </div>
      <div class="code-block code-block--wide">
        <div class="code-label">use</div>
        <pre><code
            >&lt;NumericFormat
  bind:value=&#123;amount&#125;
  locale="en-US"
  options=&#123;&#123;
    formatStyle: NumberFormatStyle.Currency,
    currency: 'USD',
    precision: 2
  &#125;&#125;
  onValueChange=&#123;(&#123; floatValue, formattedValue, value &#125;) =&gt; &#123;
    /* react-number-format compatible payload */
  &#125;&#125;
/&gt;</code
          ></pre>
      </div>
    </div>
  </section>

  <footer class="colophon">
    <div class="colophon-rule"></div>
    <div class="colophon-grid">
      <div class="colophon-cell">
        <div class="colophon-key">SET IN</div>
        <div class="colophon-val">
          <em>Fraunces</em>, <em>Newsreader</em>, <em>JetBrains Mono</em>
        </div>
      </div>
      <div class="colophon-cell">
        <div class="colophon-key">STACK</div>
        <div class="colophon-val">Svelte 5 · Vite · Vitest · TypeScript</div>
      </div>
      <div class="colophon-cell">
        <div class="colophon-key">LICENCE</div>
        <div class="colophon-val">MIT · since 2023</div>
      </div>
      <div class="colophon-cell">
        <div class="colophon-key">SOURCE</div>
        <div class="colophon-val">
          <a href="https://github.com/pitis/svelte-number-format">
            github.com/pitis/svelte-number-format
          </a>
        </div>
      </div>
    </div>
    <div class="colophon-demos">
      <span class="colophon-key">FORM-LIBRARY DEMOS</span>
      <!-- eslint-disable svelte/no-navigation-without-resolve -->
      <a href="demos/superforms/">Superforms</a>
      <span class="colophon-sep">·</span>
      <a href="demos/formsnap/">Formsnap</a>
      <span class="colophon-sep">·</span>
      <a href="demos/felte/">Felte</a>
      <!-- eslint-enable svelte/no-navigation-without-resolve -->
    </div>
    <div class="colophon-stamp">— fin —</div>
  </footer>
</div>

<style>
  :global(:root) {
    /* warm paper + ink */
    --paper: #f1ede2;
    --paper-shade: #e6e1d1;
    --paper-rule: #191915;
    --ink: #111111;
    --ink-dim: #6a6355;
    --ink-faint: #a39a86;
    --signal: #d84315;
    --signal-soft: #efd1c5;
    --field-bg: #ffffff;
    --field-rule: #111111;
  }

  :global(html.dark) {
    --paper: #111110;
    --paper-shade: #1e1b17;
    --paper-rule: #3a332a;
    --ink: #f1ede2;
    --ink-dim: #a69d89;
    --ink-faint: #575142;
    --signal: #ff6a3d;
    --signal-soft: #3a2218;
    --field-bg: #1b1a17;
    --field-rule: #f1ede2;
  }

  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: 'Newsreader', Georgia, serif;
    font-feature-settings:
      'liga' 1,
      'dlig' 1,
      'kern' 1,
      'onum' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition:
      background-color 0.6s ease,
      color 0.6s ease;
  }

  :global(code),
  :global(pre) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-feature-settings: 'tnum' 1;
  }

  :global(::selection) {
    background: var(--signal);
    color: var(--paper);
  }

  .sheet {
    position: relative;
    max-width: 1240px;
    margin: 0 auto;
    padding: clamp(1.5rem, 3vw, 3.5rem) clamp(1.25rem, 4vw, 4rem)
      clamp(3rem, 6vw, 6rem);
    min-height: 100vh;
  }

  .grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    opacity: 0.04;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  }

  :global(html.dark) .grain {
    mix-blend-mode: screen;
    opacity: 0.06;
  }

  /* -------- HERO -------- */
  .hero {
    padding-top: 0.25rem;
    padding-bottom: clamp(2rem, 4vw, 3rem);
    margin-bottom: clamp(2rem, 5vw, 4rem);
    border-bottom: 1.5px solid var(--paper-rule);
  }

  .hero-top {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 0.5px solid var(--ink-faint);
    margin-bottom: clamp(1.75rem, 4vw, 3rem);
  }

  .dateline {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-dim);
    margin: 0;
    animation: fadeUp 0.6s ease both;
  }

  .dateline-sep {
    color: var(--ink-faint);
  }

  .hero-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(1.5rem, 5vw, 4rem);
    align-items: start;
  }

  @media (max-width: 900px) {
    .hero-body {
      grid-template-columns: minmax(0, 1fr);
      gap: 1.75rem;
    }
  }

  .wordmark {
    font-family: 'Fraunces', serif;
    font-variation-settings:
      'opsz' 144,
      'wght' 420,
      'SOFT' 60;
    font-size: clamp(2.6rem, 7vw, 5.75rem);
    line-height: 0.9;
    letter-spacing: -0.04em;
    margin: 0;
    color: var(--ink);
    display: flex;
    flex-direction: column;
    font-style: normal;
  }

  .wordmark-line {
    display: block;
    animation: fadeUp 0.8s ease both;
  }

  .wordmark-line:nth-child(1) {
    animation-delay: 0.05s;
  }
  .wordmark-line:nth-child(2) {
    animation-delay: 0.13s;
  }
  .wordmark-line:nth-child(3) {
    animation-delay: 0.21s;
  }

  .wordmark-line:last-child {
    color: var(--signal);
    font-style: italic;
    font-variation-settings:
      'opsz' 144,
      'wght' 420,
      'SOFT' 100;
  }

  .dash {
    color: var(--ink-faint);
    font-style: normal;
    font-variation-settings:
      'opsz' 144,
      'wght' 300,
      'SOFT' 0;
    margin: 0 -0.02em;
  }

  .wordmark-sup {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.14em;
    letter-spacing: 0.06em;
    font-weight: 400;
    vertical-align: super;
    margin-left: 0.3em;
    top: -0.55em;
    color: var(--ink-dim);
    font-style: normal;
  }

  .hero-lede {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.5rem);
    padding-top: 0.35rem;
    max-width: 52ch;
    animation: fadeUp 1s 0.3s ease both;
  }

  .strapline {
    font-family: 'Newsreader', serif;
    font-size: clamp(1.02rem, 1.3vw, 1.18rem);
    line-height: 1.45;
    color: var(--ink);
    margin: 0;
    font-weight: 350;
  }

  .strapline em {
    font-style: italic;
    color: var(--ink-dim);
  }

  .svelte-mark {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72em;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--signal);
    margin-left: 0.25em;
    padding: 0.1em 0.5em;
    border: 1px solid var(--signal);
  }

  .standfirst-p {
    font-family: 'Newsreader', serif;
    font-size: clamp(1.1rem, 1.6vw, 1.4rem);
    line-height: 1.45;
    color: var(--ink);
    margin: 0;
    font-weight: 300;
    font-style: italic;
    padding-top: 0.75rem;
    border-top: 0.5px dotted var(--ink-faint);
  }

  .standfirst-p em {
    color: var(--signal);
    font-weight: 500;
  }

  .drop {
    font-family: 'Fraunces', serif;
    font-variation-settings:
      'opsz' 144,
      'wght' 700,
      'SOFT' 0;
    font-size: 3.2em;
    line-height: 0.85;
    float: left;
    margin: 0.08em 0.1em -0.12em 0;
    color: var(--signal);
    font-style: normal;
  }

  .mode-toggle {
    display: inline-flex;
    gap: 0.6rem;
    align-items: center;
    background: transparent;
    border: 1px solid var(--paper-rule);
    padding: 0.5rem 0.85rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink);
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease;
    white-space: nowrap;
    animation: fadeUp 0.7s 0.2s ease both;
  }

  .mode-toggle:hover {
    background: var(--ink);
    color: var(--paper);
  }

  .mode-toggle-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--signal);
    box-shadow: 0 0 0 3px var(--signal-soft);
  }

  /* -------- SECTIONS -------- */
  .specimens {
    margin: clamp(3rem, 6vw, 5rem) 0;
  }

  .section-head {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    gap: 1.2rem;
    align-items: baseline;
    padding-bottom: 1rem;
    margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
  }

  .section-no {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.16em;
    color: var(--signal);
    text-transform: uppercase;
  }

  .section-title {
    font-family: 'Fraunces', serif;
    font-variation-settings:
      'opsz' 48,
      'wght' 500,
      'SOFT' 40;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-style: italic;
    letter-spacing: -0.02em;
    margin: 0;
    color: var(--ink);
  }

  .section-rule {
    height: 1px;
    background: var(--paper-rule);
    align-self: center;
  }

  .section-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-dim);
    text-align: right;
    white-space: nowrap;
  }

  .section-desc code {
    background: var(--signal-soft);
    color: var(--signal);
    padding: 0.1em 0.35em;
    border-radius: 1px;
  }

  @media (max-width: 640px) {
    .section-head {
      grid-template-columns: auto 1fr;
      row-gap: 0.35rem;
    }
    .section-title {
      grid-column: 2;
    }
    .section-rule,
    .section-desc {
      display: none;
    }
  }

  /* -------- SPEC GRID -------- */
  .spec-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1px;
    background: var(--paper-rule);
    border: 1px solid var(--paper-rule);
  }

  .spec {
    grid-column: span 4;
    background: var(--paper);
    padding: 1.5rem 1.4rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    animation: fadeUp 0.7s calc(var(--delay, 0ms)) ease both;
  }

  .spec--half {
    grid-column: span 6;
  }

  .spec--quarter {
    grid-column: span 3;
  }

  .spec--twothirds {
    grid-column: span 8;
  }

  .spec--full {
    grid-column: span 12;
  }

  @media (max-width: 900px) {
    .spec,
    .spec--half,
    .spec--quarter,
    .spec--twothirds {
      grid-column: span 6;
    }
    .spec--full {
      grid-column: span 12;
    }
  }

  @media (max-width: 560px) {
    .spec,
    .spec--half,
    .spec--quarter,
    .spec--twothirds,
    .spec--full {
      grid-column: span 12;
    }
  }

  .spec-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .serial {
    color: var(--signal);
    font-weight: 500;
  }

  .tag {
    color: var(--ink-dim);
    text-align: right;
  }

  .spec-field {
    margin: 0.25rem 0;
  }

  :global(.num-input) {
    width: 100%;
    box-sizing: border-box;
    display: block;
    background: transparent;
    border: 0;
    border-bottom: 1.5px solid var(--field-rule);
    padding: 0.6rem 0 0.55rem;
    font-family: 'Fraunces', serif;
    font-variation-settings:
      'opsz' 48,
      'wght' 420,
      'SOFT' 0;
    font-feature-settings: 'tnum' 1;
    font-size: clamp(1.5rem, 3vw, 2rem);
    letter-spacing: -0.01em;
    color: var(--ink);
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
    border-radius: 0;
  }

  :global(.num-input::placeholder) {
    color: var(--ink-faint);
    font-style: italic;
    font-variation-settings:
      'opsz' 48,
      'wght' 300,
      'SOFT' 80;
  }

  :global(.num-input:focus) {
    outline: none;
    border-bottom-color: var(--signal);
  }

  .spec-readout {
    display: flex;
    align-items: baseline;
    gap: 0.55rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--ink-dim);
    border-top: 0.5px dotted var(--ink-faint);
    padding-top: 0.75rem;
    margin-top: auto;
  }

  .readout-arrow {
    color: var(--signal);
    font-weight: 600;
  }

  .readout-label {
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.68rem;
    color: var(--ink-dim);
  }

  .readout-code {
    color: var(--ink);
    background: var(--paper-shade);
    padding: 0.1em 0.5em;
    font-size: 0.78rem;
    word-break: break-all;
  }

  .readout-aside {
    margin-left: auto;
    font-style: italic;
    font-family: 'Newsreader', serif;
    font-size: 0.82rem;
    color: var(--ink-faint);
  }

  .spec-readout--swatch .swatch {
    display: inline-block;
    width: 1.4rem;
    height: 1.4rem;
    border: 1px solid var(--paper-rule);
    vertical-align: middle;
    flex-shrink: 0;
  }

  /* payload table */
  .payload {
    width: 100%;
    border-collapse: collapse;
    border-top: 0.5px dotted var(--ink-faint);
    margin-top: auto;
    padding-top: 0.5rem;
  }

  .payload th,
  .payload td {
    padding: 0.35rem 0;
    text-align: left;
    vertical-align: top;
  }

  .payload th {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--ink-dim);
    width: 10rem;
  }

  .payload td code {
    font-size: 0.82rem;
    color: var(--ink);
    background: var(--paper-shade);
    padding: 0.1em 0.45em;
    display: inline-block;
    word-break: break-all;
  }

  /* -------- LEDGER -------- */
  .ledger {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Newsreader', serif;
    font-size: 1.05rem;
  }

  .ledger thead th {
    text-align: left;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-dim);
    padding: 0.5rem 1rem 0.75rem;
    border-bottom: 1px solid var(--paper-rule);
  }

  .ledger tbody td {
    padding: 0.85rem 1rem;
    border-bottom: 0.5px dotted var(--ink-faint);
    animation: fadeUp 0.6s calc(var(--delay, 0ms)) ease both;
  }

  .ledger .col-label {
    color: var(--ink);
    font-size: 1.15rem;
  }

  .ledger .col-label em {
    font-style: italic;
    color: var(--ink-dim);
    font-size: 0.85em;
  }

  .col-money {
    font-family: 'Fraunces', serif;
    font-variation-settings:
      'opsz' 48,
      'wght' 500,
      'SOFT' 0;
    font-feature-settings: 'tnum' 1;
    font-size: 1.4rem;
    color: var(--signal);
    text-align: right;
    letter-spacing: -0.01em;
    width: 40%;
  }

  .col-money--left {
    text-align: left;
    color: var(--ink);
  }

  .col-raw {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    color: var(--ink-dim);
    text-align: right;
    width: 25%;
  }

  .col-raw code {
    background: var(--paper-shade);
    padding: 0.1em 0.45em;
  }

  .ledger-divider td {
    padding: 0;
    height: 0.5rem;
    border-bottom: none;
    background: transparent;
  }

  @media (max-width: 640px) {
    .col-money {
      font-size: 1.1rem;
    }
    .ledger .col-label {
      font-size: 1rem;
    }
    .ledger thead,
    .col-raw {
      display: none;
    }
    .ledger tbody td {
      padding: 0.65rem 0.4rem;
    }
  }

  /* -------- CODE BLOCKS -------- */
  .code-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1px;
    background: var(--paper-rule);
    border: 1px solid var(--paper-rule);
  }

  .code-block {
    background: var(--paper);
    padding: 1rem 1.25rem 1.25rem;
    grid-column: span 6;
  }

  .code-block--wide {
    grid-column: span 12;
    background: #111110;
    color: #f1ede2;
  }

  .code-block--wide .code-label {
    color: var(--signal);
  }

  .code-block--wide pre code {
    color: #f1ede2;
  }

  @media (max-width: 700px) {
    .code-block {
      grid-column: span 12;
    }
  }

  .code-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-dim);
    margin-bottom: 0.6rem;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  pre code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.86rem;
    line-height: 1.55;
    color: var(--ink);
    background: transparent;
    padding: 0;
  }

  /* -------- COLOPHON -------- */
  .colophon {
    margin-top: clamp(3rem, 6vw, 5rem);
    padding-top: clamp(2rem, 4vw, 3rem);
    position: relative;
  }

  .colophon-rule {
    height: 1px;
    background: var(--paper-rule);
    margin-bottom: 2rem;
  }

  .colophon-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 780px) {
    .colophon-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .colophon-key {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-dim);
    margin-bottom: 0.4rem;
  }

  .colophon-val {
    font-family: 'Newsreader', serif;
    font-size: 0.95rem;
    color: var(--ink);
  }

  .colophon-val em {
    font-style: italic;
  }

  .colophon-val a {
    color: var(--signal);
    text-decoration: none;
    border-bottom: 0.5px solid var(--signal);
    padding-bottom: 1px;
  }

  .colophon-val a:hover {
    background: var(--signal);
    color: var(--paper);
    border-bottom-color: transparent;
  }

  .colophon-demos {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    padding: 1rem 0 1.5rem;
    border-top: 0.5px dotted var(--ink-faint);
    margin-bottom: 1.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
  }

  .colophon-demos .colophon-key {
    margin-bottom: 0;
    margin-right: 0.5rem;
  }

  .colophon-demos a {
    color: var(--signal);
    text-decoration: none;
    border-bottom: 0.5px solid var(--signal);
    padding-bottom: 1px;
  }

  .colophon-demos a:hover {
    background: var(--signal);
    color: var(--paper);
    border-bottom-color: transparent;
  }

  .colophon-sep {
    color: var(--ink-faint);
  }

  .colophon-stamp {
    text-align: center;
    font-family: 'Fraunces', serif;
    font-variation-settings:
      'opsz' 144,
      'wght' 300,
      'SOFT' 100;
    font-style: italic;
    font-size: 1rem;
    color: var(--ink-faint);
    letter-spacing: 0.2em;
  }

  /* -------- KEYFRAMES -------- */
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
</style>

<script lang="ts">
  import { z as z3 } from 'zod'
  import { z as z4 } from 'zod/v4'
  import {
    NumericFormat,
    PatternFormat,
    MaskPatterns,
    NumberFormatStyle
  } from '$lib/index.js'

  let amount = $state<number | null>(1500)
  let phone = $state<string | null>('4155551234')

  // The same rules written twice: custom messages use { message } in Zod 3
  // and { error } in Zod 4. The plain-string shorthand works in both.
  const schema3 = z3.object({
    amount: z3
      .number()
      .min(0)
      .max(1_000_000, { message: 'Must be ≤ 1,000,000' }),
    phone: z3
      .string()
      .regex(/^\d{10}$/, { message: 'Must be exactly 10 digits' })
  })

  const schema4 = z4.object({
    amount: z4.number().min(0).max(1_000_000, { error: 'Must be ≤ 1,000,000' }),
    phone: z4.string().regex(/^\d{10}$/, { error: 'Must be exactly 10 digits' })
  })

  const result3 = $derived(schema3.safeParse({ amount, phone }))
  const result4 = $derived(schema4.safeParse({ amount, phone }))

  function issues(result: {
    success: boolean
    error?: { issues: { path: PropertyKey[]; message: string }[] }
  }) {
    if (result.success || !result.error) return []
    return result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  }

  const snippetSchema = `// Identical in Zod 3 and Zod 4
import * as z from 'zod'          // Zod 3
import * as z from 'zod/v4'       // Zod 4 API from the zod@3.25+ package
import * as z from 'zod'          // or zod@4 installed directly

const schema = z.object({
  amount: z.number().min(0).max(1_000_000),
  phone: z.string().regex(/^\\d{10}$/, 'Must be exactly 10 digits')
})`

  const snippetMessages = `// Custom error params were renamed
z3.number().max(1_000_000, { message: 'Must be ≤ 1,000,000' })  // Zod 3
z4.number().max(1_000_000, { error: 'Must be ≤ 1,000,000' })    // Zod 4
z.number().max(1_000_000, 'Must be ≤ 1,000,000')                // both`

  const snippetSuperforms = `// sveltekit-superforms ships an adapter per major
import { zodClient } from 'sveltekit-superforms/adapters'   // Zod 3
import { zod4Client } from 'sveltekit-superforms/adapters'  // Zod 4`

  const snippetRemote = `// SvelteKit remote form functions accept any Standard
// Schema validator — Zod 3.24+ and Zod 4 both qualify
export const postForm = form(
  z.object({ amount: z.number().min(0) }),
  async (data) => { /* data.amount is a number */ }
)`
</script>

<h1 class="demo-title">Zod 3 <span>× Zod 4</span></h1>

<p class="demo-lede">
  <code>svelte-number-format</code> has no Zod dependency at all —
  <code>bind:value</code> hands you a plain number or raw string, so any
  validator (or none) works. Below, the same two bound values are validated live
  through <em>both</em> Zod majors at once.
</p>

<div class="live-form">
  <div class="field">
    <label for="amount-zod">Amount</label>
    <NumericFormat
      id="amount-zod"
      bind:value={amount}
      locale="en-US"
      options={{
        formatStyle: NumberFormatStyle.Currency,
        currency: 'USD',
        precision: 2
      }}
      class="field-input"
    />
    <p class="field-hint">
      Try an amount over $1,000,000, or clear the field, and watch both columns
      react.
    </p>
  </div>

  <div class="field">
    <label for="phone-zod">Phone</label>
    <PatternFormat
      id="phone-zod"
      bind:value={phone}
      format={MaskPatterns.PHONE_US}
      class="field-input"
    />
  </div>
</div>

<div class="compare">
  <section class="compare-col">
    <h2 class="compare-head">
      Zod 3 <code>import &#123; z &#125; from 'zod'</code>
    </h2>
    {#if result3.success}
      <p class="verdict ok">✓ valid</p>
      <pre class="state">{JSON.stringify(result3.data, null, 2)}</pre>
    {:else}
      <p class="verdict bad">✗ invalid</p>
      <ul class="issues">
        {#each issues(result3) as issue (issue)}
          <li>{issue}</li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="compare-col">
    <h2 class="compare-head">
      Zod 4 <code>import &#123; z &#125; from 'zod/v4'</code>
    </h2>
    {#if result4.success}
      <p class="verdict ok">✓ valid</p>
      <pre class="state">{JSON.stringify(result4.data, null, 2)}</pre>
    {:else}
      <p class="verdict bad">✗ invalid</p>
      <ul class="issues">
        {#each issues(result4) as issue (issue)}
          <li>{issue}</li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<h2 class="section-head">What actually differs</h2>

<p class="demo-lede">
  For the schemas these components need, the API is the same in both majors. The
  differences show up at the edges:
</p>

<h3 class="snippet-head">Schemas</h3>
<pre class="state">{snippetSchema}</pre>

<h3 class="snippet-head">Custom error messages</h3>
<pre class="state">{snippetMessages}</pre>

<h3 class="snippet-head">Superforms &amp; Formsnap</h3>
<pre class="state">{snippetSuperforms}</pre>

<h3 class="snippet-head">Felte</h3>
<p class="note">
  <code>@felte/validator-zod</code> declares a <code>zod ^3</code> peer dependency,
  so the Felte demo sticks with Zod 3.
</p>

<h3 class="snippet-head">SvelteKit remote form functions</h3>
<pre class="state">{snippetRemote}</pre>

<style>
  .demo-title {
    font-family: 'Fraunces', serif;
    font-variation-settings:
      'opsz' 144,
      'wght' 500,
      'SOFT' 40;
    font-size: clamp(2rem, 4vw, 3rem);
    font-style: italic;
    letter-spacing: -0.02em;
    margin: 0 0 0.5rem;
  }
  .demo-title span {
    color: var(--ink-faint);
    font-style: normal;
    font-weight: 300;
    font-size: 0.55em;
    letter-spacing: 0;
    margin-left: 0.3rem;
    vertical-align: middle;
  }
  .demo-lede {
    font-family: 'Newsreader', serif;
    font-size: 1.05rem;
    color: var(--ink-dim);
    line-height: 1.5;
    max-width: 58ch;
    margin: 0 0 2rem;
  }
  .demo-lede code {
    background: var(--paper-shade);
    padding: 0.1em 0.4em;
    font-size: 0.88em;
    color: var(--signal);
  }
  .live-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-dim);
  }
  :global(.field-input) {
    width: 100%;
    box-sizing: border-box;
    background: transparent;
    border: 0;
    border-bottom: 1.5px solid var(--rule);
    padding: 0.5rem 0;
    font-family: 'Fraunces', serif;
    font-feature-settings: 'tnum' 1;
    font-size: 1.35rem;
    color: var(--ink);
    border-radius: 0;
  }
  :global(.field-input:focus) {
    outline: none;
    border-bottom-color: var(--signal);
  }
  .field-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: var(--ink-faint);
    margin: 0;
  }
  .compare {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  .compare-col {
    border: 1px solid var(--rule);
    padding: 1rem 1.25rem;
  }
  .compare-head {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 0.75rem;
  }
  .compare-head code {
    display: block;
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.72rem;
    color: var(--ink-faint);
    margin-top: 0.25rem;
  }
  .verdict {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    margin: 0 0 0.75rem;
  }
  .verdict.ok {
    color: #2e7d32;
  }
  .verdict.bad {
    color: var(--signal);
  }
  .issues {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--signal);
    margin: 0;
    padding-left: 1.1rem;
  }
  .issues li {
    margin-bottom: 0.35rem;
  }
  .section-head {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }
  .snippet-head {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-dim);
    margin: 1.75rem 0 0.5rem;
  }
  .note {
    font-family: 'Newsreader', serif;
    font-size: 1rem;
    color: var(--ink-dim);
    margin: 0;
    max-width: 58ch;
  }
  .note code {
    background: var(--paper-shade);
    padding: 0.1em 0.4em;
    font-size: 0.88em;
  }
  .state {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    background: var(--paper-shade);
    padding: 0.85rem 1rem;
    margin: 0;
    overflow-x: auto;
  }
</style>

<script lang="ts">
  import { z as z3 } from 'zod'
  import { z as z4 } from 'zod/v4'
  import {
    NumericFormat,
    PatternFormat,
    MaskPatterns,
    NumberFormatStyle
  } from '$lib/index.js'
  import SeoHead from '../../SeoHead.svelte'

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

<SeoHead
  title="Zod 3 vs Zod 4 Validation in Svelte — svelte-number-format"
  description="The same number and phone inputs validated live through Zod 3 and Zod 4 side by side, with the API differences that matter: message vs error params, adapters, and Standard Schema."
  path="/demos/zod/"
/>

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
  .compare {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
    margin-bottom: 3rem;
  }
  .compare-col {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg-soft);
    padding: 1rem 1.25rem;
  }
  .compare-head {
    font-family: var(--font-mono);
    font-size: 12.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0 0 0.75rem;
  }
  .compare-head code {
    display: block;
    text-transform: none;
    letter-spacing: 0;
    font-size: 11.5px;
    color: var(--fg-faint);
    margin-top: 0.25rem;
    font-family: var(--font-mono);
  }
  .verdict {
    font-family: var(--font-mono);
    font-size: 13px;
    margin: 0 0 0.75rem;
  }
  .verdict.ok {
    color: #2da44e;
  }
  :global(html[data-theme='dark']) .verdict.ok {
    color: #3fb950;
  }
  .verdict.bad {
    color: var(--accent);
  }
  .issues {
    font-family: var(--font-mono);
    font-size: 12.5px;
    color: var(--accent);
    margin: 0;
    padding-left: 1.1rem;
  }
  .issues li {
    margin-bottom: 0.35rem;
  }
  .section-head {
    font-size: 1.25rem;
    font-weight: 650;
    letter-spacing: -0.02em;
    margin: 2.5rem 0 0.5rem;
  }
  .snippet-head {
    font-family: var(--font-mono);
    font-size: 11.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-muted);
    margin: 1.75rem 0 0.5rem;
  }
</style>

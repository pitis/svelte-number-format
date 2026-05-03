<script lang="ts">
  import { createForm } from 'felte'
  import { validator } from '@felte/validator-zod'
  import {
    NumericFormat,
    PatternFormat,
    MaskPatterns,
    NumberFormatStyle
  } from '$lib/index.js'
  import { demoSchema, demoDefaults, type DemoSchema } from '../schema.js'

  let amount = $state<number | null>(demoDefaults.amount)
  let phone = $state<string | null>(demoDefaults.phone)
  let flash = $state<string | null>(null)

  const { form, errors, isSubmitting, setFields } = createForm<DemoSchema>({
    initialValues: demoDefaults,
    extend: [validator({ schema: demoSchema })],
    onSubmit: (values: DemoSchema) => {
      flash = `Accepted: $${values.amount} · ${values.phone}`
    }
  })

  // Sync local bindable state → Felte's internal form store.
  $effect(() => {
    setFields('amount', amount ?? 0, true)
  })
  $effect(() => {
    setFields('phone', phone ?? '', true)
  })
</script>

<h1 class="demo-title">Felte <span>× svelte-number-format</span></h1>

<p class="demo-lede">
  <code>felte</code> is Svelte-first and fully client-side. We use its Zod
  validator and keep a slim <code>$effect</code> bridge between the component's
  <code>bind:value</code> and Felte's internal store.
</p>

<form use:form class="demo-form">
  <div class="field">
    <label for="amount-felte">Amount</label>
    <NumericFormat
      id="amount-felte"
      name="amount"
      bind:value={amount}
      locale="en-US"
      options={{
        formatStyle: NumberFormatStyle.Currency,
        currency: 'USD',
        precision: 2,
        valueRange: { min: 0, max: 1_000_000 }
      }}
      aria-invalid={$errors.amount ? 'true' : undefined}
      class="field-input"
    />
    {#if $errors.amount}
      <p class="field-error">{$errors.amount[0]}</p>
    {/if}
  </div>

  <div class="field">
    <label for="phone-felte">Phone</label>
    <PatternFormat
      id="phone-felte"
      name="phone"
      bind:value={phone}
      format={MaskPatterns.PHONE_US}
      aria-invalid={$errors.phone ? 'true' : undefined}
      class="field-input"
    />
    {#if $errors.phone}
      <p class="field-error">{$errors.phone[0]}</p>
    {/if}
  </div>

  <button type="submit" class="submit" disabled={$isSubmitting}>
    {$isSubmitting ? 'Submitting…' : 'Submit'}
  </button>

  {#if flash}
    <p class="flash">{flash}</p>
  {/if}
</form>

<pre class="state">{JSON.stringify({ amount, phone }, null, 2)}</pre>

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
    margin: 0 0 2.5rem;
  }
  .demo-lede code {
    background: var(--paper-shade);
    padding: 0.1em 0.4em;
    font-size: 0.88em;
    color: var(--signal);
  }
  .demo-form {
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
  :global(.field-input[aria-invalid='true']) {
    border-bottom-color: var(--signal);
  }
  .field-error {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--signal);
    margin: 0;
  }
  .submit {
    align-self: flex-start;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    border: 1px solid var(--ink);
    padding: 0.65rem 1.25rem;
    cursor: pointer;
  }
  .submit:hover:not(:disabled) {
    background: var(--signal);
    border-color: var(--signal);
  }
  .submit:disabled {
    opacity: 0.5;
    cursor: wait;
  }
  .flash {
    font-family: 'Newsreader', serif;
    font-style: italic;
    font-size: 1rem;
    color: var(--signal);
    margin: 0;
    padding-top: 0.5rem;
    border-top: 0.5px dotted var(--ink-faint);
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

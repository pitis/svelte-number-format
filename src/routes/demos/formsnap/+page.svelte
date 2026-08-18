<script lang="ts">
  import { superForm, setMessage } from 'sveltekit-superforms'
  import { zodClient } from 'sveltekit-superforms/adapters'
  import { Control, Field, FieldErrors, Label } from 'formsnap'
  import {
    NumericFormat,
    PatternFormat,
    MaskPatterns,
    NumberFormatStyle
  } from '$lib/index.js'
  import { demoSchema, demoDefaults, type DemoSchema } from '../schema.js'

  const form = superForm<DemoSchema>(demoDefaults, {
    SPA: true,
    dataType: 'json',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validators: zodClient(demoSchema as any),
    onUpdate({ form }) {
      if (form.valid) {
        setMessage(form, `Accepted: $${form.data.amount} · ${form.data.phone}`)
      }
    }
  })

  const { form: formData, message: flash, submitting, enhance } = form
</script>

<h1 class="demo-title">Formsnap <span>× svelte-number-format</span></h1>

<p class="demo-lede">
  <code>formsnap</code> wraps Superforms with headless a11y-correct primitives (<code
    >&lt;Field&gt;</code
  >, <code>&lt;Label&gt;</code>,
  <code>&lt;Control&gt;</code>, <code>&lt;FieldErrors&gt;</code>) that wire up
  ARIA automatically. You supply the input element.
</p>

<form method="POST" use:enhance class="demo-form">
  <Field {form} name="amount">
    <Control>
      {#snippet children({ props })}
        <div class="field">
          <Label class="field-label">Amount</Label>
          <NumericFormat
            {...props}
            bind:value={$formData.amount}
            locale="en-US"
            options={{
              formatStyle: NumberFormatStyle.Currency,
              currency: 'USD',
              precision: 2
            }}
            class="field-input"
          />
          <FieldErrors class="field-error" />
          <p class="field-hint">
            Try an amount over $1,000,000: the Zod schema rejects it with a
            validation error.
          </p>
        </div>
      {/snippet}
    </Control>
  </Field>

  <Field {form} name="phone">
    <Control>
      {#snippet children({ props })}
        <div class="field">
          <Label class="field-label">Phone</Label>
          <PatternFormat
            {...props}
            bind:value={$formData.phone}
            format={MaskPatterns.PHONE_US}
            class="field-input"
          />
          <FieldErrors class="field-error" />
        </div>
      {/snippet}
    </Control>
  </Field>

  <button type="submit" class="submit" disabled={$submitting}>
    {$submitting ? 'Submitting…' : 'Submit'}
  </button>

  {#if $flash}
    <p class="flash">{$flash}</p>
  {/if}
</form>

<pre class="state">{JSON.stringify($formData, null, 2)}</pre>

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
  :global(.field-label) {
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
  :global(.field-error) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--signal);
    margin: 0;
  }
  .field-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: var(--ink-faint);
    margin: 0;
  }
  .field-hint code {
    font-size: inherit;
    color: var(--ink-dim);
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

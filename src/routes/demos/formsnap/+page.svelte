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

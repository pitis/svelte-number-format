<script lang="ts">
  import { superForm, setMessage } from 'sveltekit-superforms'
  import { zodClient } from 'sveltekit-superforms/adapters'
  import type { DemoSchema } from '../schema.js'
  import { demoSchema, demoDefaults } from '../schema.js'
  import {
    NumericFormat,
    PatternFormat,
    MaskPatterns,
    NumberFormatStyle
  } from '$lib/index.js'
  import SeoHead from '../../SeoHead.svelte'

  const {
    form,
    errors,
    enhance,
    submitting,
    message: flash
  } = superForm<DemoSchema>(demoDefaults, {
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
</script>

<SeoHead
  title="Superforms Currency Input Demo — svelte-number-format"
  description="SvelteKit Superforms with a Zod schema and svelte-number-format: a live currency input and US phone mask with client-side validation in SPA mode."
  path="/demos/superforms/"
/>

<h1 class="demo-title">Superforms <span>× svelte-number-format</span></h1>

<p class="demo-lede">
  <code>sveltekit-superforms</code> with a Zod schema. <code>bind:value</code>
  goes straight into the form store — Superforms handles the validation and server
  round-trip.
</p>

<form method="POST" use:enhance class="demo-form">
  <div class="field">
    <label for="amount">Amount</label>
    <NumericFormat
      id="amount"
      name="amount"
      bind:value={$form.amount}
      locale="en-US"
      options={{
        formatStyle: NumberFormatStyle.Currency,
        currency: 'USD',
        precision: 2
      }}
      aria-invalid={$errors.amount ? 'true' : undefined}
      class="field-input"
    />
    {#if $errors.amount}
      <p class="field-error">{$errors.amount}</p>
    {/if}
    <p class="field-hint">
      Try an amount over $1,000,000: the Zod schema rejects it with a validation
      error.
    </p>
  </div>

  <div class="field">
    <label for="phone">Phone</label>
    <PatternFormat
      id="phone"
      name="phone"
      bind:value={$form.phone}
      format={MaskPatterns.PHONE_US}
      aria-invalid={$errors.phone ? 'true' : undefined}
      class="field-input"
    />
    {#if $errors.phone}
      <p class="field-error">{$errors.phone}</p>
    {/if}
  </div>

  <button type="submit" class="submit" disabled={$submitting}>
    {$submitting ? 'Submitting…' : 'Submit'}
  </button>

  {#if $flash}
    <p class="flash">{$flash}</p>
  {/if}
</form>

<pre class="state">{JSON.stringify($form, null, 2)}</pre>

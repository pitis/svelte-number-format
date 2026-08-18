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
  import SeoHead from '../../SeoHead.svelte'

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

  // Sync local bindable state → Felte's internal form store. The mount run
  // is skipped: initialValues already seeded the store, and setFields with
  // shouldTouch would mark the fields touched — surfacing validation errors
  // before the user ever interacts.
  let amountSeeded = false
  let phoneSeeded = false
  $effect(() => {
    const v = amount ?? 0
    if (!amountSeeded) {
      amountSeeded = true
      return
    }
    setFields('amount', v, true)
  })
  $effect(() => {
    const v = phone ?? ''
    if (!phoneSeeded) {
      phoneSeeded = true
      return
    }
    setFields('phone', v, true)
  })
</script>

<SeoHead
  title="Felte Form Validation Demo — svelte-number-format"
  description="Felte with the Zod validator and svelte-number-format: fully client-side currency and phone inputs, with a slim $effect bridge into Felte's store."
  path="/demos/felte/"
/>

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
        precision: 2
      }}
      aria-invalid={$errors.amount ? 'true' : undefined}
      class="field-input"
    />
    {#if $errors.amount}
      <p class="field-error">{$errors.amount[0]}</p>
    {/if}
    <p class="field-hint">
      Try an amount over $1,000,000: the Zod schema rejects it with a validation
      error.
    </p>
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

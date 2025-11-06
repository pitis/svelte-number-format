<script lang="ts">
  import NumberInput from '../lib/NumberFormat.svelte'
  import { NumberFormatStyle } from 'intl-number-input'

  // Basic usage with bindable value
  let amount = $state<number | null>(1234.56)

  // Currency example
  let price = $state<number | null>(99.99)

  // Percentage example
  let percentage = $state<number | null>(0.75)

  // Custom locale example
  let euroAmount = $state<number | null>(1234.56)

  function handleInput(raw: number | null, formatted: string | null) {
    console.log('Input - Raw value:', raw, 'Formatted:', formatted)
  }

  function handleChange(raw: number | null, formatted: string | null) {
    console.log('Change - Raw value:', raw, 'Formatted:', formatted)
  }
</script>

<div class="container">
  <h1>Svelte 5 Number Input Examples</h1>

  <div class="example">
    <h2>Basic Number Input</h2>
    <NumberInput
      bind:value={amount}
      options={{ precision: 2 }}
      placeholder="Enter amount"
      class="input"
    />
    <p>Value: {amount}</p>
  </div>

  <div class="example">
    <h2>Currency (USD)</h2>
    <NumberInput
      bind:value={price}
      locale="en-US"
      options={{
        formatStyle: NumberFormatStyle.Currency,
        currency: 'USD',
        precision: 2
      }}
      placeholder="$0.00"
      class="input"
    />
    <p>Value: {price}</p>
  </div>

  <div class="example">
    <h2>Percentage</h2>
    <NumberInput
      bind:value={percentage}
      locale="en-US"
      options={{
        formatStyle: NumberFormatStyle.Percent,
        precision: 2
      }}
      placeholder="0%"
      class="input"
    />
    <p>Value: {percentage}</p>
    <p>Note: Value is stored as decimal (0.75 = 75%)</p>
  </div>

  <div class="example">
    <h2>European Format (EUR)</h2>
    <NumberInput
      bind:value={euroAmount}
      locale="de-DE"
      options={{
        formatStyle: NumberFormatStyle.Currency,
        currency: 'EUR',
        precision: 2
      }}
      placeholder="0,00 €"
      class="input"
    />
    <p>Value: {euroAmount}</p>
  </div>

  <div class="example">
    <h2>With Callbacks</h2>
    <NumberInput
      bind:value={amount}
      options={{ precision: 2 }}
      onInput={handleInput}
      onChange={handleChange}
      placeholder="Type to see console logs"
      class="input"
    />
    <p>Check browser console for input/change events</p>
    <p><strong>onInput:</strong> fires on every keystroke</p>
    <p><strong>onChange:</strong> fires on blur</p>
  </div>

  <div class="example">
    <h2>Controlled Example</h2>
    <NumberInput bind:value={amount} options={{ precision: 2 }} class="input" />
    <div class="buttons">
      <button onclick={() => (amount = 100)}>Set to 100</button>
      <button onclick={() => (amount = 1000)}>Set to 1000</button>
      <button onclick={() => (amount = null)}>Clear</button>
    </div>
  </div>

  <div class="example">
    <h2>With Value Range</h2>
    <NumberInput
      bind:value={amount}
      options={{
        precision: 2,
        valueRange: { min: 0, max: 1000 }
      }}
      placeholder="0 - 1000"
      class="input"
    />
    <p>Value: {amount}</p>
    <p>Try entering values outside 0-1000 range and blur the input</p>
  </div>

  <div class="example">
    <h2>Auto Decimal Mode</h2>
    <NumberInput
      bind:value={price}
      options={{
        precision: 2,
        autoDecimalDigits: true
      }}
      placeholder="Type 1234 → 12.34"
      class="input"
    />
    <p>Value: {price}</p>
    <p>Type digits without decimal point - it's inserted automatically</p>
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  h1 {
    margin-bottom: 2rem;
  }

  .example {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #f9f9f9;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  :global(.input) {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  :global(.input:focus) {
    outline: none;
    border-color: #4a90e2;
  }

  p {
    margin: 0.5rem 0;
    color: #555;
    font-size: 0.9rem;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  button:hover {
    background: #357abd;
  }
</style>

<script lang="ts">
  import { NumericFormat, PatternFormat, NumberFormatStyle, MaskPatterns } from '../lib/index.js'

  // Separate state for each demo to avoid cross-interference
  let amountBasic = $state<number | null>(1234.56)
  let priceCurrency = $state<number | null>(99.99)
  let percentage = $state<number | null>(0.75)
  let euroAmount = $state<number | null>(1234.56)
  let amountWithCallbacks = $state<number | null>(1234.56)
  let amountControlled = $state<number | null>(1234.56)
  let amountWithRange = $state<number | null>(500)
  let priceAutoDecimal = $state<number | null>(99.99)

  // Mask input states
  let phoneNumber = $state<string | null>(null)
  let creditCard = $state<string | null>(null)
  let dateInput = $state<string | null>(null)
  let ssnInput = $state<string | null>(null)
  let zipCode = $state<string | null>(null)
  let customMask = $state<string | null>(null)

  function handleInput(raw: number | null, formatted: string | null) {
    console.log('Input - Raw value:', raw, 'Formatted:', formatted)
  }

  function handleChange(raw: number | null, formatted: string | null) {
    console.log('Change - Raw value:', raw, 'Formatted:', formatted)
  }

  function handleMaskInput(raw: string | null, masked: string | null) {
    console.log('Mask Input - Raw:', raw, 'Masked:', masked)
  }
</script>

<div class="container">
  <h1>Svelte 5 Number & Mask Input Examples</h1>

  <div class="example">
    <h2>Basic Number Input</h2>
    <NumericFormat
      bind:value={amountBasic}
      options={{ precision: 2 }}
      placeholder="Enter amount"
      class="input"
    />
    <p>Value: {amountBasic}</p>
  </div>

  <div class="example">
    <h2>Currency (USD)</h2>
    <NumericFormat
      bind:value={priceCurrency}
      locale="en-US"
      options={{
        formatStyle: NumberFormatStyle.Currency,
        currency: 'USD',
        precision: 2
      }}
      placeholder="$0.00"
      class="input"
    />
    <p>Value: {priceCurrency}</p>
  </div>

  <div class="example">
    <h2>Percentage</h2>
    <NumericFormat
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
    <NumericFormat
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
    <NumericFormat
      bind:value={amountWithCallbacks}
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
    <NumericFormat
      bind:value={amountControlled}
      options={{ precision: 2 }}
      class="input"
    />
    <div class="buttons">
      <button onclick={() => (amountControlled = 100)}>Set to 100</button>
      <button onclick={() => (amountControlled = 1000)}>Set to 1000</button>
      <button onclick={() => (amountControlled = null)}>Clear</button>
    </div>
  </div>

  <div class="example">
    <h2>With Value Range</h2>
    <NumericFormat
      bind:value={amountWithRange}
      options={{
        precision: 2,
        valueRange: { min: 0, max: 1000 }
      }}
      placeholder="0 - 1000"
      class="input"
    />
    <p>Value: {amountWithRange}</p>
    <p>Try entering values outside 0-1000 range and blur the input</p>
  </div>

  <div class="example">
    <h2>Auto Decimal Mode</h2>
    <NumericFormat
      bind:value={priceAutoDecimal}
      options={{
        precision: 2,
        autoDecimalDigits: true
      }}
      placeholder="Type 1234 → 12.34"
      class="input"
    />
    <p>Value: {priceAutoDecimal}</p>
    <p>Type digits without decimal point - it's inserted automatically</p>
  </div>

  <hr style="margin: 3rem 0; border: none; border-top: 2px solid #ddd;" />

  <h1 style="margin-bottom: 2rem;">Pattern Format Examples</h1>

  <div class="example">
    <h2>Phone Number (US Format)</h2>
    <PatternFormat
      bind:value={phoneNumber}
      format={MaskPatterns.PHONE_US}
      placeholder="(123) 456-7890"
      class="input"
      onInput={handleMaskInput}
    />
    <p>Raw Value: {phoneNumber || 'null'}</p>
    <p>Pattern: (###) ###-####</p>
  </div>

  <div class="example">
    <h2>Credit Card</h2>
    <PatternFormat
      bind:value={creditCard}
      format={MaskPatterns.CREDIT_CARD}
      placeholder="1234 5678 9012 3456"
      class="input"
    />
    <p>Raw Value: {creditCard || 'null'}</p>
    <p>Pattern: #### #### #### ####</p>
  </div>

  <div class="example">
    <h2>Date (US Format)</h2>
    <PatternFormat
      bind:value={dateInput}
      format={MaskPatterns.DATE_US}
      placeholder="MM/DD/YYYY"
      class="input"
    />
    <p>Raw Value: {dateInput || 'null'}</p>
    <p>Pattern: ##/##/####</p>
  </div>

  <div class="example">
    <h2>Social Security Number</h2>
    <PatternFormat
      bind:value={ssnInput}
      format={MaskPatterns.SSN}
      placeholder="123-45-6789"
      class="input"
    />
    <p>Raw Value: {ssnInput || 'null'}</p>
    <p>Pattern: ###-##-####</p>
  </div>

  <div class="example">
    <h2>ZIP Code</h2>
    <PatternFormat
      bind:value={zipCode}
      format={MaskPatterns.ZIP_US}
      placeholder="12345"
      class="input"
    />
    <p>Raw Value: {zipCode || 'null'}</p>
    <p>Pattern: #####</p>
  </div>

  <div class="example">
    <h2>Custom Pattern</h2>
    <PatternFormat
      bind:value={customMask}
      format="AAA-###-***"
      placeholder="ABC-123-XYZ"
      class="input"
    />
    <p>Raw Value: {customMask || 'null'}</p>
    <p>Pattern: AAA-###-*** (A=letter, #=digit, *=alphanumeric)</p>
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

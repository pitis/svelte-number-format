<script lang="ts">
  import { base } from '$app/paths'
  import SeoHead from '../SeoHead.svelte'

  const cards = [
    {
      slug: 'superforms',
      title: 'Superforms',
      description:
        'sveltekit-superforms with a Zod schema — bind:value straight into the form store, client-side validation, SPA mode.'
    },
    {
      slug: 'formsnap',
      title: 'Formsnap',
      description:
        'Headless a11y-correct primitives on top of Superforms — Field, Label, Control and FieldErrors wire the ARIA for you.'
    },
    {
      slug: 'felte',
      title: 'Felte',
      description:
        'Fully client-side with the Zod validator and a slim $effect bridge between bind:value and Felte’s store.'
    },
    {
      slug: 'zod',
      title: 'Zod 3 × 4',
      description:
        'The same bound values validated through both Zod majors at once, plus the API differences that matter.'
    }
  ]
</script>

<SeoHead
  title="Svelte 5 Form Demos — Superforms, Formsnap, Felte & Zod"
  description="Live svelte-number-format demos: currency and phone inputs wired into Superforms, Formsnap and Felte with Zod validation, plus a Zod 3 vs Zod 4 comparison."
  path="/demos/"
/>

<h1 class="demo-title">Demos <span>real forms, real validation</span></h1>

<p class="demo-lede">
  <code>svelte-number-format</code> in working integrations: each page is a live
  form you can type into, with the full source in
  <code>src/routes/demos/</code>.
</p>

<div class="demo-grid">
  <!-- eslint-disable svelte/no-navigation-without-resolve -->
  {#each cards as card (card.slug)}
    <a class="demo-card" href="{base}/demos/{card.slug}/">
      <h2>{card.title}</h2>
      <p>{card.description}</p>
      <span class="demo-card-cta">Open demo →</span>
    </a>
  {/each}
  <!-- eslint-enable svelte/no-navigation-without-resolve -->
</div>

<style>
  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }
  .demo-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg-soft);
    padding: 1.25rem 1.4rem;
    color: inherit;
    text-decoration: none;
    transition:
      border-color 0.15s ease,
      transform 0.08s ease;
  }
  .demo-card:hover {
    border-color: var(--line-strong);
    transform: translateY(-1px);
  }
  .demo-card h2 {
    font-size: 1.05rem;
    font-weight: 650;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .demo-card p {
    font-size: 13.5px;
    color: var(--fg-muted);
    line-height: 1.55;
    margin: 0;
    flex: 1;
  }
  .demo-card-cta {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent);
  }
</style>

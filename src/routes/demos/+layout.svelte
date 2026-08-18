<script lang="ts">
  import { page } from '$app/state'
  import { base } from '$app/paths'

  let { children } = $props()

  const demos = [
    { slug: 'superforms', label: 'Superforms' },
    { slug: 'formsnap', label: 'Formsnap' },
    { slug: 'felte', label: 'Felte' },
    { slug: 'zod', label: 'Zod 3 × 4' }
  ]
</script>

<svelte:head>
  <title>Form-library demos · svelte-number-format</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,0..100&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=JetBrains+Mono:wght@300;400;500;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="demo-sheet">
  <header class="demo-head">
    <!-- eslint-disable svelte/no-navigation-without-resolve -->
    <a class="demo-home" href="{base}/">← svelte-number-format</a>
    <nav class="demo-nav" aria-label="Form library demos">
      {#each demos as demo (demo.slug)}
        {@const active = page.url.pathname.endsWith('/' + demo.slug)}
        <a
          href="{base}/demos/{demo.slug}"
          class="demo-nav-link"
          class:is-active={active}
          aria-current={active ? 'page' : undefined}
        >
          {demo.label}
        </a>
      {/each}
    </nav>
    <!-- eslint-enable svelte/no-navigation-without-resolve -->
  </header>

  <main class="demo-main">
    {@render children()}
  </main>
</div>

<style>
  :global(:root) {
    --paper: #f1ede2;
    --paper-shade: #e6e1d1;
    --ink: #111111;
    --ink-dim: #6a6355;
    --ink-faint: #a39a86;
    --signal: #d84315;
    --signal-soft: #efd1c5;
    --rule: #191915;
  }

  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: 'Newsreader', Georgia, serif;
    font-feature-settings:
      'liga' 1,
      'kern' 1,
      'onum' 1;
    -webkit-font-smoothing: antialiased;
  }

  :global(code) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }

  .demo-sheet {
    max-width: 820px;
    margin: 0 auto;
    padding: clamp(1.5rem, 3vw, 3rem) clamp(1.25rem, 4vw, 3rem)
      clamp(3rem, 5vw, 5rem);
  }

  .demo-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--rule);
    margin-bottom: clamp(2rem, 4vw, 3rem);
  }

  .demo-home {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink);
    text-decoration: none;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--rule);
  }

  .demo-home:hover {
    background: var(--ink);
    color: var(--paper);
  }

  .demo-nav {
    display: flex;
    gap: 0.25rem;
  }

  .demo-nav-link {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-dim);
    text-decoration: none;
    padding: 0.35rem 0.6rem;
    border: 1px solid transparent;
  }

  .demo-nav-link:hover {
    color: var(--ink);
    border-color: var(--rule);
  }

  .demo-nav-link.is-active {
    color: var(--signal);
    border-color: var(--signal);
  }
</style>

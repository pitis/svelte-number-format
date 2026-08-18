<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { base } from '$app/paths'

  let { children } = $props()

  const demos = [
    { slug: 'superforms', label: 'Superforms' },
    { slug: 'formsnap', label: 'Formsnap' },
    { slug: 'felte', label: 'Felte' },
    { slug: 'zod', label: 'Zod 3 × 4' }
  ]

  // Same theme convention as the home page: shared localStorage key and
  // data-theme attribute, so the mode carries across the whole site.
  let dark = $state(false)

  onMount(() => {
    const stored = localStorage.getItem('snf-theme')
    if (stored === 'dark' || stored === 'light') {
      dark = stored === 'dark'
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })

  $effect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('snf-theme', dark ? 'dark' : 'light')
    }
  })
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
    href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="demo-page">
  <header class="nav">
    <div class="nav-inner">
      <!-- eslint-disable svelte/no-navigation-without-resolve -->
      <a href="{base}/" class="brand">
        <span class="brand-mark">#</span>
        <span>svelte-number-format</span>
      </a>
      <a class="nav-tag" href="{base}/demos/">demos</a>
      <nav class="nav-links" aria-label="Form library demos">
        {#each demos as demo (demo.slug)}
          {@const active = page.url.pathname
            .replace(/\/$/, '')
            .endsWith('/' + demo.slug)}
          <a
            href="{base}/demos/{demo.slug}/"
            class="nav-link"
            class:is-active={active}
            aria-current={active ? 'page' : undefined}
          >
            {demo.label}
          </a>
        {/each}
        <button
          type="button"
          class="icon-btn"
          onclick={() => (dark = !dark)}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          title="Toggle theme"
        >
          {#if dark}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
              />
            </svg>
          {:else}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          {/if}
        </button>
      </nav>
      <!-- eslint-enable svelte/no-navigation-without-resolve -->
    </div>
  </header>

  <main class="demo-main">
    {@render children()}
  </main>
</div>

<style>
  /* Same design tokens as the home page */
  :global(:root) {
    --font-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif;
    --font-mono: 'Geist Mono', ui-monospace, 'SFMono-Regular', monospace;

    --bg: #ffffff;
    --bg-soft: #fafafa;
    --bg-sunken: #f4f4f4;
    --fg: #0a0a0a;
    --fg-muted: #6b6b6b;
    --fg-faint: #a3a3a3;
    --line: rgba(10, 10, 10, 0.08);
    --line-strong: rgba(10, 10, 10, 0.14);
    --accent: #ff3e00;
    --accent-soft: rgba(255, 62, 0, 0.08);

    --radius: 10px;
    --radius-lg: 14px;
  }

  :global(html[data-theme='dark']) {
    --bg: #0a0a0a;
    --bg-soft: #111111;
    --bg-sunken: #161616;
    --fg: #fafafa;
    --fg-muted: #9a9a9a;
    --fg-faint: #5a5a5a;
    --line: rgba(255, 255, 255, 0.08);
    --line-strong: rgba(255, 255, 255, 0.14);
    --accent-soft: rgba(255, 62, 0, 0.14);
  }

  :global(*) {
    box-sizing: border-box;
  }
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
  }
  :global(body) {
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-sans);
    font-feature-settings: 'ss01', 'cv11';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 15px;
    line-height: 1.5;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }
  :global(::selection) {
    background: var(--accent);
    color: #fff;
  }

  .demo-page {
    background: var(--bg);
    color: var(--fg);
    min-height: 100vh;
  }

  /* Top nav — mirrors the home page nav */
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    background: color-mix(in srgb, var(--bg) 72%, transparent);
    border-bottom: 1px solid var(--line);
  }
  .nav-inner {
    max-width: 860px;
    margin: 0 auto;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: inherit;
    text-decoration: none;
    white-space: nowrap;
  }
  .brand-mark {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--fg);
    color: var(--bg);
    display: grid;
    place-items: center;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 12px;
  }
  .nav-tag {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--fg-muted);
    padding: 3px 7px;
    border-radius: 5px;
    border: 1px solid var(--line);
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .nav-tag:hover {
    color: var(--fg);
  }
  .nav-links {
    display: flex;
    gap: 18px;
    margin-left: auto;
    align-items: center;
  }
  .nav-link {
    color: var(--fg-muted);
    font-size: 13.5px;
    transition: color 0.15s ease;
    text-decoration: none;
    white-space: nowrap;
  }
  .nav-link:hover {
    color: var(--fg);
  }
  .nav-link.is-active {
    color: var(--accent);
  }
  @media (max-width: 720px) {
    .brand span:last-child {
      display: none;
    }
    .nav-tag {
      display: none;
    }
    .nav-links {
      gap: 12px;
    }
    .nav-link {
      font-size: 12.5px;
    }
  }
  .icon-btn {
    appearance: none;
    background: transparent;
    border: 1px solid var(--line);
    color: var(--fg);
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }
  .icon-btn:hover {
    background: var(--bg-soft);
    border-color: var(--line-strong);
  }

  .demo-main {
    max-width: 860px;
    margin: 0 auto;
    padding: clamp(2rem, 4vw, 3.5rem) 28px clamp(3rem, 5vw, 5rem);
  }

  /* Shared demo-page styles, defined once for all demo pages. Scoped under
     .demo-main so nothing leaks into the home page in SPA navigation. */
  .demo-main :global(.demo-title) {
    font-size: clamp(1.7rem, 3vw, 2.3rem);
    font-weight: 650;
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin: 0 0 0.5rem;
  }
  .demo-main :global(.demo-title span) {
    color: var(--fg-faint);
    font-weight: 400;
    font-size: 0.6em;
    letter-spacing: -0.01em;
    margin-left: 0.35rem;
    vertical-align: middle;
  }
  .demo-main :global(.demo-lede) {
    font-size: 15px;
    color: var(--fg-muted);
    line-height: 1.6;
    max-width: 62ch;
    margin: 0 0 2.25rem;
  }
  .demo-main :global(.demo-lede code),
  .demo-main :global(.note code) {
    font-family: var(--font-mono);
    font-size: 0.86em;
    background: var(--bg-sunken);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 0.1em 0.35em;
    color: var(--accent);
  }
  .demo-main :global(.demo-form),
  .demo-main :global(.live-form) {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    margin-bottom: 2rem;
  }
  .demo-main :global(.field) {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .demo-main :global(.field label),
  .demo-main :global(.field .field-label) {
    font-family: var(--font-mono);
    font-size: 11.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-muted);
  }
  .demo-main :global(.field-input) {
    appearance: none;
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    padding: 13px 15px;
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: 500;
    color: var(--fg);
    outline: none;
    font-variant-numeric: tabular-nums;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }
  .demo-main :global(.field-input:focus) {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-soft);
  }
  .demo-main :global(.field-input::placeholder) {
    color: var(--fg-faint);
  }
  .demo-main :global(.field-input[aria-invalid='true']) {
    border-color: var(--accent);
  }
  .demo-main :global(.field-error) {
    font-family: var(--font-mono);
    font-size: 12.5px;
    color: var(--accent);
    margin: 0;
  }
  .demo-main :global(.field-hint) {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--fg-faint);
    margin: 0;
  }
  .demo-main :global(.submit) {
    appearance: none;
    align-self: flex-start;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    font: inherit;
    font-weight: 500;
    font-size: 14px;
    border: 1px solid transparent;
    background: var(--fg);
    color: var(--bg);
    transition:
      transform 0.08s ease,
      background 0.15s ease;
  }
  .demo-main :global(.submit:hover:not(:disabled)) {
    background: color-mix(in srgb, var(--fg) 88%, var(--accent));
  }
  .demo-main :global(.submit:active) {
    transform: translateY(1px);
  }
  .demo-main :global(.submit:disabled) {
    opacity: 0.5;
    cursor: wait;
  }
  .demo-main :global(.flash) {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent);
    margin: 0;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--line-strong);
  }
  .demo-main :global(.state) {
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.6;
    background: var(--bg-sunken);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 0.85rem 1rem;
    margin: 0;
    overflow-x: auto;
  }
  .demo-main :global(.note) {
    font-size: 15px;
    color: var(--fg-muted);
    line-height: 1.6;
    margin: 0;
    max-width: 62ch;
  }
</style>

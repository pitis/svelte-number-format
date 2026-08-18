<script lang="ts">
  interface Props {
    title: string
    description: string
    /**
     * Path from the site root with leading AND trailing slash, e.g.
     * '/demos/felte/' — the trailing slash must match trailingSlash='always'
     * in +layout.ts so the canonical URL equals the served URL.
     */
    path?: string
  }

  let { title, description, path = '/' }: Props = $props()

  // Deployed origin + paths.base (svelte.config.js). Also hardcoded in
  // +page.svelte's JSON-LD, static/robots.txt and static/sitemap.xml —
  // change all of them together.
  const SITE = 'https://pitis.github.io/svelte-number-format'
  const url = $derived(SITE + path)
  const image = `${SITE}/og.png`
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="svelte-number-format" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <!-- dimensions must match static/og.png -->
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>

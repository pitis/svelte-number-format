export const prerender = true
// SSR must stay on: with ssr=false the prerendered pages are empty JS shells —
// no text, no <title> — and search engines/social unfurlers see nothing.
export const ssr = true
// GitHub Pages serves directory/index.html but 404s bare .html files when the
// URL has a trailing slash — 'always' makes every page prerender as a
// directory index so both /demos/felte and /demos/felte/ resolve.
export const trailingSlash = 'always'

export const prerender = true
export const ssr = false
// GitHub Pages serves directory/index.html but 404s bare .html files when the
// URL has a trailing slash — 'always' makes every page prerender as a
// directory index so both /demos/felte and /demos/felte/ resolve.
export const trailingSlash = 'always'

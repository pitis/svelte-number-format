const FALLBACK_LOCALE = 'en-US'

function isValidLocale(tag: string): boolean {
  if (!tag || tag === 'undefined' || tag === 'null') return false
  try {
    new Intl.Locale(tag)
    return true
  } catch {
    return false
  }
}

export function defaultLocale(): string {
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language
    if (isValidLocale(nav)) return nav
  }
  return FALLBACK_LOCALE
}

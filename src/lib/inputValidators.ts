/**
 * Built-in validators for PatternFormat's `validate` prop.
 *
 * A validator is a pure predicate over the raw (unmasked) value:
 * `(raw: string) => boolean`. PatternFormat only calls it once the mask is
 * completely filled, so validators can assume full-length input when paired
 * with their matching mask — the standalone guards below just keep them
 * safe to use on their own.
 */

export type Validator = (raw: string) => boolean

/** CPF check digit over the first `length` digits, weights length+1 … 2. */
function cpfCheckDigit(digits: string, length: number): number {
  let sum = 0
  for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i)
  const r = sum % 11
  return r < 2 ? 0 : 11 - r
}

/** Brazilian CPF: 11 digits, two check digits. Pairs with MaskPatterns.BRAZILIAN_CPF. */
const BRAZILIAN_CPF: Validator = (raw) => {
  if (!/^\d{11}$/.test(raw)) return false
  // Repdigits (000…, 111…, …) pass the checksum but are never issued.
  if (/^(\d)\1{10}$/.test(raw)) return false
  return (
    cpfCheckDigit(raw, 9) === Number(raw[9]) &&
    cpfCheckDigit(raw, 10) === Number(raw[10])
  )
}

/**
 * Luhn checksum (credit cards, IMEIs, Canadian SINs, …). Deliberately no
 * card-number length gate: with a mask, the completeness gate already pins
 * the length. Pairs with MaskPatterns.CREDIT_CARD / CREDIT_CARD_AMEX.
 */
const LUHN: Validator = (raw) => {
  if (!/^\d{2,}$/.test(raw)) return false
  let sum = 0
  let double = false
  for (let i = raw.length - 1; i >= 0; i--) {
    let d = Number(raw[i])
    if (double && (d *= 2) > 9) d -= 9
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

/**
 * NANP number: 10 digits, area code and exchange must start 2-9 and must
 * not be N11 service codes (211 … 911). Pairs with MaskPatterns.PHONE_US.
 */
const US_PHONE: Validator = (raw) => {
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(raw)) return false
  if (raw[1] === '1' && raw[2] === '1') return false
  if (raw[4] === '1' && raw[5] === '1') return false
  return true
}

/**
 * IPv4 with three digits per octet (the shape MaskPatterns.IPV4 enforces):
 * 12 digits, each zero-padded octet ≤ 255 — e.g. 192.168.001.001.
 */
const IPV4: Validator = (raw) => {
  if (!/^\d{12}$/.test(raw)) return false
  for (let i = 0; i < 12; i += 3) {
    if (Number(raw.slice(i, i + 3)) > 255) return false
  }
  return true
}

export const Validators = {
  BRAZILIAN_CPF,
  LUHN,
  US_PHONE,
  IPV4
} as const

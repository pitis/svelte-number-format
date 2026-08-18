import { describe, it, expect } from 'vitest'
import { Validators } from './inputValidators.js'

describe('Validators', () => {
  describe('BRAZILIAN_CPF', () => {
    it('accepts valid CPFs', () => {
      expect(Validators.BRAZILIAN_CPF('14550200286')).toBe(true)
      expect(Validators.BRAZILIAN_CPF('52998224725')).toBe(true)
    })

    it('rejects CPFs with a wrong check digit', () => {
      expect(Validators.BRAZILIAN_CPF('14550200287')).toBe(false)
      expect(Validators.BRAZILIAN_CPF('52998224726')).toBe(false)
    })

    it('rejects all repdigit CPFs, which pass the checksum but are never issued', () => {
      for (let d = 0; d <= 9; d++) {
        expect(Validators.BRAZILIAN_CPF(String(d).repeat(11))).toBe(false)
      }
    })

    it('rejects wrong lengths', () => {
      expect(Validators.BRAZILIAN_CPF('1455020028')).toBe(false)
      expect(Validators.BRAZILIAN_CPF('145502002860')).toBe(false)
      expect(Validators.BRAZILIAN_CPF('')).toBe(false)
    })

    it('rejects non-digit input', () => {
      expect(Validators.BRAZILIAN_CPF('1455020028a')).toBe(false)
      expect(Validators.BRAZILIAN_CPF('145.502.002-86')).toBe(false)
    })
  })

  describe('LUHN', () => {
    it('accepts valid checksums', () => {
      expect(Validators.LUHN('4111111111111111')).toBe(true)
      expect(Validators.LUHN('378282246310005')).toBe(true)
      expect(Validators.LUHN('79927398713')).toBe(true)
    })

    it('rejects invalid checksums', () => {
      expect(Validators.LUHN('4111111111111112')).toBe(false)
      expect(Validators.LUHN('378282246310006')).toBe(false)
    })

    it('rejects empty, single-digit, and non-digit input', () => {
      expect(Validators.LUHN('')).toBe(false)
      expect(Validators.LUHN('0')).toBe(false)
      expect(Validators.LUHN('4111x11111111111')).toBe(false)
    })
  })

  describe('US_PHONE', () => {
    it('accepts a valid NANP number', () => {
      expect(Validators.US_PHONE('4155551234')).toBe(true)
    })

    it('rejects area codes and exchanges starting with 0 or 1', () => {
      expect(Validators.US_PHONE('1155551234')).toBe(false)
      expect(Validators.US_PHONE('0155551234')).toBe(false)
      expect(Validators.US_PHONE('4151551234')).toBe(false)
    })

    it('rejects N11 service codes as area code or exchange', () => {
      expect(Validators.US_PHONE('4115551234')).toBe(false)
      expect(Validators.US_PHONE('4159112345')).toBe(false)
    })

    it('rejects wrong lengths', () => {
      expect(Validators.US_PHONE('415555123')).toBe(false)
      expect(Validators.US_PHONE('41555512345')).toBe(false)
    })
  })

  describe('IPV4', () => {
    it('accepts zero-padded octets within range', () => {
      expect(Validators.IPV4('192168001001')).toBe(true)
      expect(Validators.IPV4('255255255255')).toBe(true)
      expect(Validators.IPV4('000000000000')).toBe(true)
    })

    it('rejects any octet above 255', () => {
      expect(Validators.IPV4('256168001001')).toBe(false)
      expect(Validators.IPV4('192168001999')).toBe(false)
    })

    it('rejects wrong lengths and non-digits', () => {
      expect(Validators.IPV4('19216800100')).toBe(false)
      expect(Validators.IPV4('192.168.1.1')).toBe(false)
    })
  })

  it('exports exactly the four documented validators', () => {
    expect(Object.keys(Validators).sort()).toEqual([
      'BRAZILIAN_CPF',
      'IPV4',
      'LUHN',
      'US_PHONE'
    ])
  })
})

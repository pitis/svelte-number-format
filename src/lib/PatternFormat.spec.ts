import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/svelte'
import PatternFormat from './PatternFormat.svelte'
import { MaskPatterns } from './maskPatterns.js'

describe('PatternFormat.svelte', () => {
  afterEach(() => {
    cleanup()
  })

  describe('Phone Number Pattern', () => {
    it('formats phone number correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input).toBeTruthy()

      // Simulate typing a phone number
      input.value = '1234567890'
      await fireEvent.input(input)

      expect(input.value).toBe('(123) 456-7890')
    })

    it('handles partial phone input', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12345'
      await fireEvent.input(input)

      expect(input.value).toBe('(123) 45')
    })

    it('rejects non-numeric characters in phone', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123abc456'
      await fireEvent.input(input)

      expect(input.value).toBe('(123) 456')
    })
  })

  describe('Credit Card Pattern', () => {
    it('formats credit card number correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.CREDIT_CARD
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1234567890123456'
      await fireEvent.input(input)

      expect(input.value).toBe('1234 5678 9012 3456')
    })

    it('handles partial credit card input', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.CREDIT_CARD
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12345678'
      await fireEvent.input(input)

      expect(input.value).toBe('1234 5678')
    })
  })

  describe('Date Pattern', () => {
    it('formats US date correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.DATE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12252024'
      await fireEvent.input(input)

      expect(input.value).toBe('12/25/2024')
    })

    it('formats ISO date correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.DATE_ISO
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '20241225'
      await fireEvent.input(input)

      expect(input.value).toBe('2024-12-25')
    })
  })

  describe('SSN Pattern', () => {
    it('formats SSN correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.SSN
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123456789'
      await fireEvent.input(input)

      expect(input.value).toBe('123-45-6789')
    })
  })

  describe('ZIP Code Pattern', () => {
    it('formats 5-digit ZIP correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.ZIP_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12345'
      await fireEvent.input(input)

      expect(input.value).toBe('12345')
    })

    it('formats ZIP+4 correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.ZIP_US_PLUS4
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123456789'
      await fireEvent.input(input)

      expect(input.value).toBe('12345-6789')
    })
  })

  describe('Custom Patterns', () => {
    it('handles letter pattern (A)', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'AAA-###'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = 'ABC123'
      await fireEvent.input(input)

      expect(input.value).toBe('ABC-123')
    })

    it('rejects digits in letter positions', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'AAA'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123ABC'
      await fireEvent.input(input)

      expect(input.value).toBe('ABC')
    })

    it('handles alphanumeric pattern (*)', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '***-***'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = 'A1B2C3'
      await fireEvent.input(input)

      expect(input.value).toBe('A1B-2C3')
    })

    it('handles mixed pattern correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'AA-##-**'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = 'AB12XY'
      await fireEvent.input(input)

      expect(input.value).toBe('AB-12-XY')
    })
  })

  describe('Callbacks', () => {
    it('calls onInput callback with raw and formatted values', async () => {
      let rawValue: string | null = null
      let formattedValue: string | null = null

      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          onInput: (raw: string | null, formatted: string | null) => {
            rawValue = raw
            formattedValue = formatted
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1234567890'
      await fireEvent.input(input)

      expect(rawValue).toBe('1234567890')
      expect(formattedValue).toBe('(123) 456-7890')
    })

    it('calls onChange callback on change event', async () => {
      let rawValue: string | null = null
      let formattedValue: string | null = null

      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.DATE_US,
          onChange: (raw: string | null, formatted: string | null) => {
            rawValue = raw
            formattedValue = formatted
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12252024'
      await fireEvent.change(input)

      expect(rawValue).toBe('12252024')
      expect(formattedValue).toBe('12/25/2024')
    })
  })

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          placeholder: 'Enter phone',
          class: 'custom-input',
          id: 'test-input'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.placeholder).toBe('Enter phone')
      expect(input.className).toBe('custom-input')
      expect(input.id).toBe('test-input')
    })

    it('auto-generates placeholder from pattern when not provided', () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '###-##-####',
          maskChar: '_'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.placeholder).toBe('___-__-____')
    })
  })

  describe('Empty and Null Values', () => {
    it('handles empty initial value', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: null
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('returns null for completely empty input', async () => {
      let rawValue: string | null = 'initial'

      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          onInput: (raw: string | null) => {
            rawValue = raw
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = ''
      await fireEvent.input(input)

      expect(rawValue).toBe(null)
    })
  })

  describe('Literal Characters', () => {
    it('automatically adds literal characters', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '(###) ###-####'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123'
      await fireEvent.input(input)

      // Should add opening paren automatically
      expect(input.value).toContain('(')
    })

    it('skips over literal characters when typing', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '##/##/####'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1225'
      await fireEvent.input(input)

      // Should automatically add slashes
      expect(input.value).toBe('12/25')
    })
  })
})

import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/svelte'
import PatternFormat from './PatternFormat.svelte'
import { MaskPatterns } from './maskPatterns.js'
import { InputValidators } from './inputValidations.js'

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

  describe('Brazilian CPF - Formatting', () => {
    it('formats Brazilian CPF correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.BRAZILIAN_CPF
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.input(input, { target: { value: '12312312300' } })
      expect(input.value).toBe('123.123.123-00')
    })
  })

  describe('Brazilian CPF - Event Triggers', () => {
    it('validates only on input when configured', async () => {
      const { container } = render(PatternFormat, {
        props: {
          withValidation: {
            reportAs: 'css-class',
            validate: InputValidators.BRAZILIAN_CPF,
            className: { valid: 'valid', invalid: 'invalid' },
            applyOn: 'input'
          }
        }
      })
      const input = container.querySelector('input') as HTMLInputElement

      // Should've been validated
      await fireEvent.input(input, { target: { value: '1' } })
      expect(input.classList.contains('invalid')).toBe(true)
      expect(input.classList.contains('valid')).toBe(false)

      // Should NOT validate
      await fireEvent.change(input, { target: { value: '14550200286' } })
      expect(input.classList.contains('valid')).toBe(false)
      expect(input.classList.contains('invalid')).toBe(true)
    })

    it('validates only on change when configured', async () => {
      const { container } = render(PatternFormat, {
        props: {
          withValidation: {
            reportAs: 'css-class',
            validate: InputValidators.BRAZILIAN_CPF,
            className: { valid: 'valid', invalid: 'invalid' },
            applyOn: 'change'
          }
        }
      })
      const input = container.querySelector('input') as HTMLInputElement

      // Should NOT validate yet
      await fireEvent.input(input, { target: { value: '14550200286' } })
      expect(input.classList.contains('valid')).toBe(false)
      expect(input.classList.contains('invalid')).toBe(false)

      await fireEvent.change(input)
      expect(input.classList.contains('valid')).toBe(true)
      expect(input.classList.contains('invalid')).toBe(false)
    })

    it('validates  on both input and change when configured', async () => {
      const { container } = render(PatternFormat, {
        props: {
          withValidation: {
            reportAs: 'css-class',
            validate: InputValidators.BRAZILIAN_CPF,
            className: { valid: 'valid', invalid: 'invalid' },
            applyOn: 'both'
          }
        }
      })
      const input = container.querySelector('input') as HTMLInputElement

      // Should've been validated
      await fireEvent.input(input, { target: { value: '1' } })
      expect(input.classList.contains('invalid')).toBe(true)
      expect(input.classList.contains('valid')).toBe(false)

      // Should've been validated
      await fireEvent.change(input, { target: { value: '14550200286' } })
      expect(input.classList.contains('valid')).toBe(true)
      expect(input.classList.contains('invalid')).toBe(false)
    })
  })

  describe('Brazilian CPF - Validation - Reporting', () => {
    describe('reportsAs: css-class', () => {
      const cssProps = {
        format: MaskPatterns.BRAZILIAN_CPF,
        withValidation: {
          reportAs: 'css-class',
          validate: InputValidators.BRAZILIAN_CPF,
          className: {
            valid: 'input-valid',
            invalid: 'input-error'
          },
          applyOn: 'input'
        }
      }

      it('applies valid/invalid classes on input change', async () => {
        const { container } = render(PatternFormat, { props: cssProps })
        const input = container.querySelector('input') as HTMLInputElement

        // Test Invalid Case
        await fireEvent.input(input, { target: { value: '11111111111' } })
        expect(input.classList.contains('input-error')).toBe(true)
        expect(input.classList.contains('input-valid')).toBe(false)

        // Test Valid Case
        await fireEvent.input(input, { target: { value: '14550200286' } })
        expect(input.classList.contains('input-valid')).toBe(true)
        expect(input.classList.contains('input-error')).toBe(false)
      })
    })

    describe('reportAs: data-attribute', () => {
      const dataProps = {
        format: MaskPatterns.BRAZILIAN_CPF,
        withValidation: {
          reportAs: 'data-attribute',
          validate: InputValidators.BRAZILIAN_CPF,
          attributeName: 'data-is-valid'
        }
      }

      it('updates the data attribute correctly', async () => {
        const { container } = render(PatternFormat, { props: dataProps })
        const input = container.querySelector('input') as HTMLInputElement

        // Test Invalid Case
        await fireEvent.input(input, { target: { value: '11111111111' } })
        expect(input.getAttribute('data-is-valid')).toBe('false')

        // Test Valid Case
        await fireEvent.input(input, { target: { value: '14550200286' } })
        expect(input.getAttribute('data-is-valid')).toBe('true')
      })
    })

    describe('reportAs: callback', () => {
      it('fires the callback with validation result', async () => {
        const spy = vi.fn()

        const { container } = render(PatternFormat, {
          props: {
            format: MaskPatterns.BRAZILIAN_CPF,
            withValidation: {
              reportAs: 'callback',
              validate: InputValidators.BRAZILIAN_CPF,
              onValidation: spy
            }
          }
        })
        const input = container.querySelector('input') as HTMLInputElement

        // Trigger Invalid
        await fireEvent.input(input, { target: { value: '11111111111' } })
        expect(spy).toHaveBeenLastCalledWith(false)

        // Trigger Valid
        await fireEvent.input(input, { target: { value: '14550200286' } })
        expect(spy).toHaveBeenLastCalledWith(true)
      })
    })
  })

  describe('Brazilian CPF - Validation - Custom Validator', () => {
    it('uses a custom function passed as a prop', async () => {
      const customValidator = (val: string) => val === 'magic-word'

      const { container } = render(PatternFormat, {
        props: {
          withValidation: {
            reportAs: 'data-attribute',
            validate: customValidator,
            attributeName: 'data-magic'
          }
        }
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.input(input, { target: { value: 'wrong' } })
      expect(input.getAttribute('data-magic')).toBe('false')

      await fireEvent.input(input, { target: { value: 'magic-word' } })
      expect(input.getAttribute('data-magic')).toBe('true')
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

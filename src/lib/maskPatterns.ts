/**
 * Common mask patterns for various input types
 *
 * Pattern characters:
 * # = digit (0-9)
 * A = letter (a-z, A-Z)
 * * = alphanumeric
 * All other characters are literals (e.g., parentheses, dashes, spaces)
 */

export const MaskPatterns = {
  // Phone numbers
  PHONE_US: '(###) ###-####',
  PHONE_US_WITH_EXT: '(###) ###-#### ext. #####',
  PHONE_INTERNATIONAL: '+## (###) ###-####',

  // Credit cards
  CREDIT_CARD: '#### #### #### ####',
  CREDIT_CARD_AMEX: '#### ###### #####',

  // Dates
  DATE_US: '##/##/####',
  DATE_ISO: '####-##-##',
  DATE_EU: '##.##.####',
  TIME_12H: '##:## AM',
  TIME_24H: '##:##',
  DATETIME_US: '##/##/#### ##:##',

  // Identification
  SSN: '###-##-####',
  BRAZILIAN_CPF: '###.###.###-##',
  ZIP_US: '#####',
  ZIP_US_PLUS4: '#####-####',

  // Other
  IPV4: '###.###.###.###',
  MAC_ADDRESS: '##:##:##:##:##:##',
  HEX_COLOR: '#******'
} as const

export type MaskPatternKeys = keyof typeof MaskPatterns

export type MaskPattern = (typeof MaskPatterns)[MaskPatternKeys] | string

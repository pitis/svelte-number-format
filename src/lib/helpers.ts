export function validateBrazilianCPFDigit(
  cpf: string,
  position: number
): boolean {
  let sum = 0
  let weight = position

  // Iterate over the digits preceding the check digit
  for (let i = 0; i < position - 1; i++) {
    sum += parseInt(cpf[i]) * weight
    weight--
  }

  const remainder = (sum * 10) % 11
  const calculatedDigit = remainder === 10 || remainder === 11 ? 0 : remainder

  // Compare calculated digit with the actual digit in the string
  return calculatedDigit === parseInt(cpf[position - 1])
}

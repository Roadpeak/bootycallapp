/**
 * Normalises a Kenyan phone number to the 254XXXXXXXXX form M-Pesa expects.
 *
 * Accepts what people (and browser autofill) actually type: "+254 712 345 678",
 * "0712-345-678", "712345678", "254712345678". Anything else is returned as
 * digits only, so the caller's format check still rejects it.
 */
export function toMpesaPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('254')) return digits
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1)
    if (/^[17]\d{8}$/.test(digits)) return '254' + digits
    return digits
}

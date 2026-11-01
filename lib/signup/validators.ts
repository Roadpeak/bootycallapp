// lib/signup/validators.ts
import { toMpesaPhone } from '@/lib/utils/phone'

/**
 * Field checks for the signup forms. They mirror the API's rules so people
 * find out on the step they are on, not after filling in everything.
 * Each returns an error message, or null when the value is fine.
 */

export type FieldErrors = Record<string, string>

export const MIN_PASSWORD = 8

export function required(value: string | undefined | null, label: string): string | null {
    return value && value.trim() ? null : `${label} is required`
}

export function validateEmail(email: string): string | null {
    if (!email.trim()) return 'Email is required'
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
        ? null
        : 'Enter a valid email address, e.g. name@gmail.com'
}

export function validateKenyanPhone(phone: string, label = 'Phone number'): string | null {
    if (!phone.trim()) return `${label} is required`
    return /^254[17]\d{8}$/.test(toMpesaPhone(phone))
        ? null
        : `${label} must be a Kenyan mobile number, e.g. 0712345678`
}

export function validatePassword(password: string): string | null {
    if (!password) return 'Password is required'
    if (password.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters`
    return null
}

export function validatePasswordMatch(password: string, confirm: string): string | null {
    if (!confirm) return 'Confirm your password'
    return password === confirm ? null : 'Passwords do not match'
}

export function validateAdultDob(dob: string): string | null {
    if (!dob) return 'Date of birth is required'
    const date = new Date(dob)
    if (Number.isNaN(date.getTime()) || date.getFullYear() < 1900) return 'Enter a valid date of birth'
    const eighteen = new Date(date)
    eighteen.setFullYear(date.getFullYear() + 18)
    return eighteen <= new Date() ? null : 'You must be at least 18 years old to join'
}

export function validateMinLength(value: string, min: number, label: string): string | null {
    const length = value.trim().length
    if (!length) return `${label} is required`
    return length >= min ? null : `${label} needs at least ${min} characters (${length} so far)`
}

/** Collects the non-null results into a FieldErrors map. */
export function collect(checks: Record<string, string | null>): FieldErrors {
    const errors: FieldErrors = {}
    for (const [field, message] of Object.entries(checks)) {
        if (message) errors[field] = message
    }
    return errors
}

/**
 * The control for a field: an input/select/textarea by name (not, say, the
 * page's <meta name="description">), or a group with id `field-<name>`.
 */
export function findField(name: string): HTMLElement | null {
    return (
        document.querySelector<HTMLElement>(
            `input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`,
        ) ?? document.getElementById(`field-${name}`)
    )
}

/**
 * Scrolls the first invalid field (in `order`) into view and focuses it.
 * Fields are found by name, or by an element with id `field-<name>` for
 * groups such as photos or languages.
 */
export function focusFirstError(errors: FieldErrors, order: string[]) {
    const first = order.find((f) => errors[f]) ?? Object.keys(errors)[0]
    if (!first) return
    // Wait for the step to render and the messages to appear
    setTimeout(() => {
        const el = findField(first)
        if (!el) return
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (typeof el.focus === 'function') el.focus({ preventScroll: true })
    }, 60)
}

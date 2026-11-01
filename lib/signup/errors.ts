// lib/signup/errors.ts
import type { FieldErrors } from './validators'

/** Where an API field lives on a signup form: the form field and its step. */
export type FieldMap = Record<string, { field: string; step: number }>

export interface SignupProblem {
    /** One sentence for the banner. */
    message: string
    /** Messages to show next to fields. */
    fieldErrors: FieldErrors
    /** The step to send the person back to, when the problem is on a field. */
    step: number | null
}

/**
 * Turns a failed signup request into something a person can act on: what
 * went wrong, which field, and which step to go back to.
 */
export function parseSignupError(err: any, fieldMap: FieldMap, fallback = 'Signup failed. Please try again.'): SignupProblem {
    const response = err?.response
    if (!response) {
        // Thrown by our own checks before sending (e.g. a photo we could not read)
        if (err?.message && !/network|timeout/i.test(err.message) && err.name !== 'AxiosError') {
            return { message: err.message, fieldErrors: {}, step: null }
        }
        return {
            message: "We couldn't reach LoveBite. Check your internet connection and try again. Your details are still filled in.",
            fieldErrors: {},
            step: null,
        }
    }

    const data = response.data ?? {}
    const status: number = response.status
    const fieldErrors: FieldErrors = {}
    let step: number | null = null

    const issues: { field: string; message: string }[] = Array.isArray(data.errors) ? data.errors : []
    for (const issue of issues) {
        const target = fieldMap[issue.field] ?? fieldMap[issue.field.split('.')[0]]
        if (!target) continue
        fieldErrors[target.field] ??= issue.message
        step = step === null ? target.step : Math.min(step, target.step)
    }

    if (status === 413) {
        const target = fieldMap.photos
        if (target) {
            fieldErrors[target.field] ??= 'Photos are too large. Remove some, or use smaller ones.'
            step = target.step
        }
        return { message: 'Your photos are too large to upload. Remove some or use smaller ones.', fieldErrors, step }
    }
    if (status === 429) {
        return { message: 'Too many attempts. Wait a minute, then try again.', fieldErrors, step }
    }
    if (status >= 500) {
        return {
            message: 'Something went wrong on our side. Your details are still filled in, so please try again in a minute.',
            fieldErrors,
            step,
        }
    }

    const count = Object.keys(fieldErrors).length
    const message =
        count > 1
            ? `Please fix ${count} things highlighted below.`
            : typeof data.message === 'string' && data.message && !data.message.includes(': ')
                ? data.message
                : count === 1
                    ? Object.values(fieldErrors)[0]
                    : data.message || fallback
    return { message, fieldErrors, step }
}

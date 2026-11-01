// app/components/forms/FieldError.tsx
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { findField } from '@/lib/signup/validators'

/** A message under a form field. Renders nothing when there is no error. */
export function FieldError({ message, id }: { message?: string; id?: string }) {
    if (!message) return null
    return (
        <p id={id} role="alert" className="mt-1 flex items-start gap-1 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
            <span>{message}</span>
        </p>
    )
}

/**
 * Banner for a step: the headline problem plus a list of the fields to fix,
 * each of which jumps to its field.
 */
export function StepErrorSummary({
    message,
    errors,
    labels,
    onDismiss,
}: {
    message: string | null
    errors: Record<string, string>
    labels: Record<string, string>
    onDismiss?: () => void
}) {
    const fields = Object.keys(errors)
    if (!message && fields.length === 0) return null
    const jump = (field: string) => {
        const el = findField(field)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.focus?.({ preventScroll: true })
    }
    return (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" aria-hidden />
                <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{message || 'Please fix the highlighted fields.'}</p>
                    {message && /already registered/i.test(message) && (
                        <Link href="/auth/login" className="mt-1 inline-block text-sm font-semibold text-red-800 underline">
                            Log in to your account
                        </Link>
                    )}
                    {fields.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {fields.map((field) => (
                                <li key={field}>
                                    <button
                                        type="button"
                                        onClick={() => jump(field)}
                                        className="text-left text-sm text-red-700 underline-offset-2 hover:underline"
                                    >
                                        {labels[field] ?? field}: {errors[field]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {onDismiss && (
                    <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-red-500 hover:text-red-700">
                        ×
                    </button>
                )}
            </div>
        </div>
    )
}

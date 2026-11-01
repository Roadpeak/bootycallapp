// app/components/account/AccountDangerZone.tsx
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { WalletSummary } from '@/services/butical-api-service'
import { FieldError } from '@/app/components/forms/FieldError'

type Mode = 'deactivate' | 'delete' | null
type Done = 'deactivated' | 'deleted' | null

/**
 * Deactivate or delete your own account. Deactivating hides the profile and
 * logs out; logging in again brings it back. Deleting erases the profile for
 * good, so it asks for the password and the word DELETE.
 */
export default function AccountDangerZone() {
    const [mode, setMode] = useState<Mode>(null)
    const [done, setDone] = useState<Done>(null)
    const [password, setPassword] = useState('')
    const [reason, setReason] = useState('')
    const [confirmText, setConfirmText] = useState('')
    const [forfeit, setForfeit] = useState(false)
    const [balance, setBalance] = useState<number | null>(null)
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const open = async (next: Mode) => {
        setMode(next)
        setPassword('')
        setReason('')
        setConfirmText('')
        setForfeit(false)
        setError(null)
        setFieldErrors({})
        if (next === 'delete') {
            // Money in the wallet has to be withdrawn or knowingly given up
            try {
                const res = await ButicalAPI.wallet.getSummary()
                // Some responses are wrapped in { status, data }, some are not
                const body = res.data as WalletSummary | { data: WalletSummary }
                const summary = 'data' in body ? body.data : body
                setBalance(Number(summary?.currentBalance ?? summary?.balance ?? 0))
                setPendingWithdrawals(Number(summary?.pendingWithdrawals ?? 0))
            } catch {
                setBalance(null)
                setPendingWithdrawals(0)
            }
        }
    }

    const clearFieldError = (field: string) =>
        setFieldErrors(prev => {
            if (!prev[field]) return prev
            const next = { ...prev }
            delete next[field]
            return next
        })

    const close = () => {
        if (!busy) setMode(null)
    }

    const submit = async () => {
        const errors: Record<string, string> = {}
        if (!password) errors.password = 'Enter your password to confirm'
        if (mode === 'delete') {
            if (confirmText.trim().toUpperCase() !== 'DELETE') errors.confirm = 'Type DELETE to confirm'
            if (balance && balance > 0 && !forfeit) errors.forfeit = 'Withdraw your balance first, or tick this box to give it up'
        }
        setFieldErrors(errors)
        if (Object.keys(errors).length) {
            setError(null)
            return
        }

        setBusy(true)
        setError(null)
        try {
            if (mode === 'deactivate') {
                await ButicalAPI.users.deactivateMe({ password, reason: reason.trim() || undefined })
            } else {
                await ButicalAPI.users.deleteMe({
                    password,
                    confirm: confirmText.trim(),
                    reason: reason.trim() || undefined,
                    forfeitBalance: forfeit,
                })
            }
            TokenService.clearTokens()
            setDone(mode === 'deactivate' ? 'deactivated' : 'deleted')
            setMode(null)
        } catch (err) {
            const response = (err as { response?: { data?: { message?: string; errors?: unknown } } }).response
            const data = response?.data
            const issues = (Array.isArray(data?.errors) ? data.errors : []) as { field: string; message: string }[]
            const mapped: Record<string, string> = {}
            for (const issue of issues) {
                const key = issue.field === 'forfeitBalance' ? 'forfeit' : issue.field
                mapped[key] = issue.message
            }
            setFieldErrors(mapped)
            setError(
                Object.keys(mapped).length
                    ? null
                    : data?.message || (response ? 'Something went wrong. Please try again.' : "We couldn't reach LoveBite. Check your connection and try again."),
            )
        } finally {
            setBusy(false)
        }
    }

    if (done) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {done === 'deactivated' ? 'Your account is deactivated' : 'Your account has been deleted'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {done === 'deactivated'
                            ? 'Your profile is hidden and you have been logged out. Log in any time to bring it back.'
                            : 'Your profile and personal details have been removed. Thank you for being part of LoveBite.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => { window.location.href = '/' }}
                        className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>

            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium text-gray-900">Deactivate account</p>
                    <p className="text-sm text-gray-600">Hide your profile and log out. Log in again any time to bring it back.</p>
                </div>
                <button
                    type="button"
                    onClick={() => open('deactivate')}
                    className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Deactivate
                </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium text-red-600">Delete account</p>
                    <p className="text-sm text-gray-600">Permanently remove your profile, photos and personal details. This can&apos;t be undone.</p>
                </div>
                <button
                    type="button"
                    onClick={() => open('delete')}
                    className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    Delete
                </button>
            </div>

            {mode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="account-dialog-title"
                        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h2 id="account-dialog-title" className="text-lg font-semibold text-gray-900">
                                {mode === 'deactivate' ? 'Deactivate your account?' : 'Delete your account?'}
                            </h2>
                            <button type="button" onClick={close} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {mode === 'deactivate' ? (
                            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                                <li>Your profile is hidden from everyone.</li>
                                <li>You are logged out on all devices.</li>
                                <li>Your subscription time keeps running while you are away.</li>
                                <li>Log in again any time to bring everything back.</li>
                            </ul>
                        ) : (
                            <>
                                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                                    <li>Your profile, photos, bio and contact details are erased.</li>
                                    <li>Your likes and matches are removed.</li>
                                    <li>Any remaining subscription time is lost.</li>
                                    <li>Payment records are kept for accounting, without your profile or contact details.</li>
                                </ul>
                                {pendingWithdrawals > 0 && (
                                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                        You have a withdrawal in progress. You can delete your account once it has been paid.
                                    </p>
                                )}
                                {balance !== null && balance > 0 && (
                                    <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                        <p>
                                            You have <strong>KES {balance.toLocaleString()}</strong> in your wallet. Withdraw it first, or give it up below.
                                        </p>
                                        <label className="mt-2 flex items-start gap-2">
                                            <input
                                                id="field-forfeit"
                                                type="checkbox"
                                                checked={forfeit}
                                                onChange={(e) => { setForfeit(e.target.checked); clearFieldError('forfeit') }}
                                                className="mt-0.5"
                                            />
                                            <span>I understand I will lose this balance</span>
                                        </label>
                                        <FieldError message={fieldErrors.forfeit} />
                                    </div>
                                )}
                            </>
                        )}

                        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                        <div className="mt-4 space-y-3">
                            <div>
                                <label htmlFor="account-password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    id="account-password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    aria-invalid={!!fieldErrors.password}
                                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-pink-500"
                                />
                                <FieldError message={fieldErrors.password} />
                            </div>

                            <div>
                                <label htmlFor="account-reason" className="mb-1 block text-sm font-medium text-gray-700">
                                    Why are you leaving? <span className="font-normal text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    id="account-reason"
                                    name="reason"
                                    rows={2}
                                    maxLength={500}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            {mode === 'delete' && (
                                <div>
                                    <label htmlFor="account-confirm" className="mb-1 block text-sm font-medium text-gray-700">
                                        Type <strong>DELETE</strong> to confirm
                                    </label>
                                    <input
                                        id="account-confirm"
                                        name="confirm"
                                        autoComplete="off"
                                        value={confirmText}
                                        aria-invalid={!!fieldErrors.confirm}
                                        onChange={(e) => { setConfirmText(e.target.value); clearFieldError('confirm') }}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-red-500"
                                    />
                                    <FieldError message={fieldErrors.confirm} />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={close}
                                disabled={busy}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={busy || (mode === 'delete' && pendingWithdrawals > 0)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${mode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                            >
                                {busy ? 'Please wait…' : mode === 'delete' ? 'Delete my account' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

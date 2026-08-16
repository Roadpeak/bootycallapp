// app/subscription/escort/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Crown, Check, Loader2, AlertCircle, Phone, X, Clock,
} from 'lucide-react'
import ButicalAPI from '@/services/butical-api-service'
import type {
    EscortSubscriptionStatus,
    SubscriptionPlanOption,
} from '@/services/butical-api-service'
import { TIER_STYLES, type EscortTier } from '@/app/components/cards/EscortCard'

/** Highest tier first, matching how escorts are ordered on the browse page. */
const TIER_ORDER: EscortTier[] = ['VVIP', 'VIP', 'PRIME', 'REGULAR']

/**
 * What each tier gets. The prices and durations come from the API so an admin
 * can change them, but the benefits are presentation and live here.
 */
const TIER_BENEFITS: Record<EscortTier, string[]> = {
    VVIP: [
        'Top placement — listed above every other tier',
        'Contact details visible to everyone, no unlock needed',
        'Priority in search results',
        'Verification badge',
    ],
    VIP: [
        'Listed above Prime and Regular profiles',
        'Contact details visible to everyone, no unlock needed',
        'Priority in search results',
        'Verification badge',
    ],
    PRIME: [
        'Listed above Regular profiles',
        'Clients pay to unlock your contact',
        'Verification badge',
    ],
    REGULAR: [
        'Profile visible on the site',
        'Clients pay to unlock your contact',
    ],
}

const formatKes = (amount: number) => `KSh ${amount.toLocaleString()}`

const formatDuration = (days: number) => `${days} Day${days === 1 ? '' : 's'}`

export default function EscortSubscriptionPage() {
    const [plans, setPlans] = useState<SubscriptionPlanOption[]>([])
    const [status, setStatus] = useState<EscortSubscriptionStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [activeTier, setActiveTier] = useState<EscortTier>('VVIP')
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanOption | null>(null)
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] =
        useState<'idle' | 'pending' | 'success' | 'failed'>('idle')
    const [paymentError, setPaymentError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true)
                setLoadError(null)

                const [plansRes, statusRes] = await Promise.all([
                    ButicalAPI.plans.list(),
                    // An escort with no profile yet has no status; the page still
                    // needs to show the catalogue.
                    ButicalAPI.escorts.getMySubscription().catch(() => null),
                ])

                const planList = (plansRes.data as any)?.data || plansRes.data || []
                setPlans(Array.isArray(planList) ? planList : [])

                if (statusRes) {
                    setStatus((statusRes.data as any)?.data || statusRes.data || null)
                }
            } catch (err: any) {
                setLoadError(
                    err.response?.data?.message || 'Could not load subscription plans.',
                )
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    // Plans for the tier the user is currently looking at, cheapest first.
    const plansForTier = useMemo(
        () =>
            plans
                .filter((plan) => plan.tier === activeTier)
                .sort((a, b) => a.durationDays - b.durationDays),
        [plans, activeTier],
    )

    const availableTiers = useMemo(
        () => TIER_ORDER.filter((tier) => plans.some((plan) => plan.tier === tier)),
        [plans],
    )

    const handlePayment = async () => {
        if (!selectedPlan) return

        if (!mpesaPhone.trim()) {
            setPaymentError('Enter the M-Pesa number to charge.')
            return
        }

        setIsProcessing(true)
        setPaymentStatus('pending')
        setPaymentError(null)

        try {
            const response = await ButicalAPI.payments.subscribeToPlan(
                selectedPlan.id,
                mpesaPhone.trim(),
            )
            const paymentData = (response.data as any)?.data || response.data

            if (!paymentData?.paymentId) {
                throw new Error('Could not start the payment. Please try again.')
            }

            // Poll until M-Pesa confirms. The STK prompt sits on the user's phone
            // until they enter their PIN, so this needs a generous window.
            let attempts = 0
            const maxAttempts = 60 // ~2 minutes at 2s intervals

            const poll = setInterval(async () => {
                attempts += 1

                try {
                    const statusResponse = await ButicalAPI.payments.getPaymentStatus(
                        paymentData.paymentId,
                    )
                    const payment = (statusResponse.data as any)?.data || statusResponse.data

                    if (payment?.status === 'COMPLETED') {
                        clearInterval(poll)
                        setPaymentStatus('success')
                        setIsProcessing(false)
                        setTimeout(() => window.location.reload(), 1800)
                        return
                    }

                    if (payment?.status === 'FAILED' || payment?.status === 'CANCELLED') {
                        clearInterval(poll)
                        setPaymentStatus('failed')
                        setPaymentError('The payment did not go through. Please try again.')
                        setIsProcessing(false)
                        return
                    }
                } catch {
                    // A single failed poll is not fatal; keep trying until the
                    // attempt budget runs out.
                }

                if (attempts >= maxAttempts) {
                    clearInterval(poll)
                    setPaymentStatus('failed')
                    setPaymentError(
                        'We did not get confirmation in time. If you were charged, refresh in a moment.',
                    )
                    setIsProcessing(false)
                }
            }, 2000)
        } catch (err: any) {
            setPaymentStatus('failed')
            setPaymentError(
                err.response?.data?.message || err.message || 'Payment failed. Please try again.',
            )
            setIsProcessing(false)
        }
    }

    const closeModal = () => {
        if (isProcessing) return
        setSelectedPlan(null)
        setPaymentStatus('idle')
        setPaymentError(null)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-3" />
                    <p className="text-gray-600">Loading plans…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link
                        href="/profile/escort"
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Back to profile"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Subscription Plans</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 pt-6">
                {loadError && (
                    <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{loadError}</p>
                    </div>
                )}

                <CurrentPlanCard status={status} />

                {/* Tier selector */}
                <div className="mt-8 mb-5 flex flex-wrap gap-2">
                    {availableTiers.map((tier) => {
                        const isActive = tier === activeTier
                        return (
                            <button
                                key={tier}
                                onClick={() => setActiveTier(tier)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                    isActive
                                        ? TIER_STYLES[tier].badge
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {TIER_STYLES[tier].label}
                            </button>
                        )
                    })}
                </div>

                {/* Benefits for the selected tier */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                        <Crown className={`w-4 h-4 ${TIER_STYLES[activeTier].text}`} />
                        What {TIER_STYLES[activeTier].label} includes
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {TIER_BENEFITS[activeTier].map((benefit) => (
                            <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                                <Check className="mt-0.5 w-4 h-4 flex-shrink-0 text-emerald-500" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Durations */}
                {plansForTier.length === 0 ? (
                    <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                        No plans are available for this tier right now.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {plansForTier.map((plan) => {
                            const isCurrent =
                                status?.active &&
                                status.tier === plan.tier

                            return (
                                <div
                                    key={plan.id}
                                    className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                                >
                                    <p className="text-sm font-medium text-gray-500">
                                        {formatDuration(plan.durationDays)}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {formatKes(plan.price)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formatKes(Math.round(plan.price / plan.durationDays))} per day
                                    </p>

                                    <button
                                        onClick={() => {
                                            setSelectedPlan(plan)
                                            setPaymentStatus('idle')
                                            setPaymentError(null)
                                        }}
                                        className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 ${TIER_STYLES[plan.tier].badge}`}
                                    >
                                        {isCurrent ? 'Extend' : 'Choose'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}

                <p className="mt-6 text-center text-xs text-gray-500">
                    Payments are in Kenyan Shillings and charged via M-Pesa.
                    Renewing before your plan ends adds the new days onto your existing expiry.
                </p>
            </main>

            {selectedPlan && (
                <PaymentModal
                    plan={selectedPlan}
                    phone={mpesaPhone}
                    onPhoneChange={setMpesaPhone}
                    onPay={handlePayment}
                    onClose={closeModal}
                    isProcessing={isProcessing}
                    paymentStatus={paymentStatus}
                    error={paymentError}
                />
            )}
        </div>
    )
}

function CurrentPlanCard({ status }: { status: EscortSubscriptionStatus | null }) {
    if (!status) return null

    if (!status.active) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <div>
                        <h2 className="font-semibold text-amber-900">
                            {status.mustPay ? 'Your profile is hidden' : 'No active plan'}
                        </h2>
                        <p className="mt-1 text-sm text-amber-800">
                            {status.mustPay
                                ? 'Clients cannot find you until you choose a plan below.'
                                : 'Choose a plan below to get listed higher and reach more clients.'}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const tier = status.tier as EscortTier
    const expiringSoon = status.daysRemaining <= 3

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-gray-500">Current plan</p>
                    <div className="mt-1 flex items-center gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${TIER_STYLES[tier].badge}`}
                        >
                            {TIER_STYLES[tier].label}
                        </span>
                        <span className="text-sm text-gray-600">Active</span>
                    </div>
                </div>

                <div className={`flex items-center gap-2 text-sm ${expiringSoon ? 'text-red-600' : 'text-gray-600'}`}>
                    <Clock className="h-4 w-4" />
                    <span>
                        {status.daysRemaining === 0
                            ? 'Expires today'
                            : `${status.daysRemaining} day${status.daysRemaining === 1 ? '' : 's'} left`}
                    </span>
                </div>
            </div>

            {expiringSoon && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    Renew soon — your profile is hidden from clients once this expires.
                </p>
            )}
        </div>
    )
}

function PaymentModal({
    plan,
    phone,
    onPhoneChange,
    onPay,
    onClose,
    isProcessing,
    paymentStatus,
    error,
}: {
    plan: SubscriptionPlanOption
    phone: string
    onPhoneChange: (value: string) => void
    onPay: () => void
    onClose: () => void
    isProcessing: boolean
    paymentStatus: 'idle' | 'pending' | 'success' | 'failed'
    error: string | null
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {TIER_STYLES[plan.tier].label} — {formatDuration(plan.durationDays)}
                        </h2>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatKes(plan.price)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {paymentStatus === 'success' ? (
                    <div className="py-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <Check className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="font-semibold text-gray-900">Payment received</p>
                        <p className="mt-1 text-sm text-gray-600">Activating your plan…</p>
                    </div>
                ) : (
                    <>
                        <label
                            htmlFor="mpesaPhone"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            M-Pesa number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="mpesaPhone"
                                type="tel"
                                inputMode="numeric"
                                value={phone}
                                onChange={(e) => onPhoneChange(e.target.value)}
                                disabled={isProcessing}
                                placeholder="254712345678"
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Format: 254XXXXXXXXX
                        </p>

                        {error && (
                            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        {isProcessing && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Check your phone and enter your M-Pesa PIN…
                            </div>
                        )}

                        <button
                            onClick={onPay}
                            disabled={isProcessing}
                            className={`mt-5 w-full rounded-lg px-4 py-3 font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 ${TIER_STYLES[plan.tier].badge}`}
                        >
                            {isProcessing ? 'Waiting for payment…' : `Pay ${formatKes(plan.price)}`}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, Wallet, LogOut } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { EscortSubscriptionStatus } from '@/services/butical-api-service'

/**
 * Blocks an escort whose subscription has lapsed.
 *
 * When `mustPay` is set the escort is hidden from the site, so the app shows
 * this instead of its normal interface. Two routes stay reachable: the plans
 * page, so they can pay, and the wallet, because money they already earned is
 * theirs whether or not they hold a current plan.
 *
 * Renders children untouched for everyone else, so it is safe to wrap any
 * escort-facing page.
 */
export default function EscortPaywall({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [status, setStatus] = useState<EscortSubscriptionStatus | null>(null)
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const check = async () => {
            if (!TokenService.getAccessToken()) {
                setIsChecking(false)
                return
            }

            try {
                const response = await ButicalAPI.escorts.getMySubscription()
                setStatus((response.data as any)?.data || response.data || null)
            } catch {
                // A non-escort (or an escort with no profile yet) has no
                // subscription to check. Failing open is right here: the
                // backend already hides lapsed profiles, and locking someone
                // out because a status call failed would be worse.
                setStatus(null)
            } finally {
                setIsChecking(false)
            }
        }
        check()
    }, [])

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        )
    }

    if (!status?.mustPay) {
        return <>{children}</>
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <Lock className="h-7 w-7 text-amber-600" />
                </div>

                <h1 className="text-xl font-bold text-gray-900">
                    Your profile is hidden
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    Your subscription has ended, so clients can no longer find you.
                    Choose a plan to get your profile back on the site.
                </p>

                <button
                    onClick={() => router.push('/subscription/escort')}
                    className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                >
                    View plans
                </button>

                {/* Earnings already made stay accessible: withholding them would
                    be taking money the escort has already earned. */}
                <button
                    onClick={() => router.push('/referral/wallet')}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <Wallet className="h-4 w-4" />
                    My wallet
                </button>

                <button
                    onClick={() => {
                        TokenService.clearTokens()
                        router.push('/auth/login')
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                </button>
            </div>
        </div>
    )
}

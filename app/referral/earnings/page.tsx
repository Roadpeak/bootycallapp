// app/referral/earnings/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Users, Network, Loader2, AlertCircle, Gift,
} from 'lucide-react'
import { useReferrals } from '@/lib/hooks/butical-api-hooks'
import type { ReferralRecord } from '@/services/butical-api-service'
import { getPublicDisplayName } from '@/lib/utils/display-name'

const formatKes = (amount: number) => `KSh ${amount.toLocaleString()}`

/**
 * Full date and time. Users asked to see exactly when someone joined, and a
 * bare date is ambiguous for anyone who signed up the same day.
 */
const formatJoined = (value: string | undefined) => {
    if (!value) return 'Unknown'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown'

    return date.toLocaleString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

type Tab = 'direct' | 'chain'

export default function ReferralEarningsPage() {
    const {
        directReferrals,
        chainReferrals,
        summary,
        loading,
        error,
    } = useReferrals()

    const [activeTab, setActiveTab] = useState<Tab>('direct')

    const rows = activeTab === 'direct' ? directReferrals : chainReferrals

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
                    <Link
                        href="/referral"
                        className="-ml-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
                        aria-label="Back to referrals"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Referral Earnings</h1>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 pt-6">
                {error && (
                    <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Headline total */}
                <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
                    <p className="text-sm text-pink-100">Total earned from referrals</p>
                    <p className="mt-1 text-3xl font-bold">
                        {formatKes(summary.totalEarnings)}
                    </p>
                    {summary.pendingEarnings > 0 && (
                        <p className="mt-2 text-sm text-pink-100">
                            {formatKes(summary.pendingEarnings)} still pending
                        </p>
                    )}
                </div>

                {/* The two ways money arrives */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <SummaryCard
                        icon={<Users className="h-5 w-5 text-pink-500" />}
                        label="People you invited"
                        count={summary.directCount}
                        earnings={summary.directEarnings}
                    />
                    <SummaryCard
                        icon={<Network className="h-5 w-5 text-purple-500" />}
                        label="Invited by your referrals"
                        count={summary.chainCount}
                        earnings={summary.chainEarnings}
                    />
                </div>

                <p className="mt-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    You earn twice: once when someone you invited pays, and again — a
                    smaller share — when <em>they</em> invite someone who pays.
                </p>

                {/* Tabs */}
                <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="flex border-b border-gray-200">
                        <TabButton
                            active={activeTab === 'direct'}
                            onClick={() => setActiveTab('direct')}
                            label={`Your referrals (${directReferrals.length})`}
                        />
                        <TabButton
                            active={activeTab === 'chain'}
                            onClick={() => setActiveTab('chain')}
                            label={`Their referrals (${chainReferrals.length})`}
                        />
                    </div>

                    <div className="p-4">
                        {rows.length > 0 ? (
                            <ReferralList rows={rows} />
                        ) : (
                            <EmptyState tab={activeTab} />
                        )}
                    </div>
                </div>

                <Link
                    href="/referral/wallet"
                    className="mt-4 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Go to wallet
                </Link>
            </main>
        </div>
    )
}

function SummaryCard({
    icon,
    label,
    count,
    earnings,
}: {
    icon: React.ReactNode
    label: string
    count: number
    earnings: number
}) {
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                {icon}
                <p className="text-sm text-gray-600">{label}</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{count}</p>
            <p className="mt-0.5 text-sm font-medium text-green-600">
                {formatKes(earnings)} earned
            </p>
        </div>
    )
}

function TabButton({
    active,
    onClick,
    label,
}: {
    active: boolean
    onClick: () => void
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                active
                    ? 'border-b-2 border-pink-600 text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
            }`}
        >
            {label}
        </button>
    )
}

/**
 * Groups rows by the person they relate to, since a referral who renews
 * produces one row per payment. Showing five separate entries for the same
 * friend reads as five people.
 */
function ReferralList({ rows }: { rows: ReferralRecord[] }) {
    const people = useMemo(() => {
        const map = new Map<
            string,
            { name: string; joinedAt: string | undefined; total: number; payments: number }
        >()

        for (const row of rows) {
            const key = row.referred?.id ?? row.id
            const existing = map.get(key)
            const amount = Number(row.rewardAmount) || 0

            if (existing) {
                existing.total += amount
                existing.payments += 1
            } else {
                map.set(key, {
                    name: getPublicDisplayName(row.referred),
                    joinedAt: row.referred?.createdAt ?? row.createdAt,
                    total: amount,
                    payments: 1,
                })
            }
        }

        return [...map.entries()]
            .map(([id, value]) => ({ id, ...value }))
            .sort((a, b) => b.total - a.total)
    }, [rows])

    return (
        <ul className="space-y-3">
            {people.map((person) => (
                <li
                    key={person.id}
                    className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-4"
                >
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{person.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Joined {formatJoined(person.joinedAt)}
                        </p>
                        {person.payments > 1 && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {person.payments} payments
                            </p>
                        )}
                    </div>

                    <p className="flex-shrink-0 font-semibold text-green-600">
                        +{formatKes(person.total)}
                    </p>
                </li>
            ))}
        </ul>
    )
}

function EmptyState({ tab }: { tab: Tab }) {
    return (
        <div className="py-10 text-center">
            <Gift className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            {tab === 'direct' ? (
                <>
                    <p className="text-gray-600">No referrals yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Share your code to start earning.
                    </p>
                    <Link
                        href="/referral"
                        className="mt-4 inline-block rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600"
                    >
                        Get your code
                    </Link>
                </>
            ) : (
                <>
                    <p className="text-gray-600">Nothing here yet</p>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
                        When the people you invited start inviting others, their
                        payments will earn you a share too.
                    </p>
                </>
            )}
        </div>
    )
}

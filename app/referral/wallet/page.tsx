// app/wallet/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Wallet, TrendingUp, DollarSign, Gift,
    ArrowUpRight, ArrowDownRight, Clock, Check, X,
    CreditCard, Smartphone, ExternalLink, ChevronRight,
    Download, Filter
} from 'lucide-react'

// Mock wallet data
const MOCK_WALLET_DATA = {
    balance: 25450,
    pendingEarnings: 3200,
    totalEarnings: 45680,
    transactions: [
        {
            id: '1',
            type: 'credit',
            source: 'Referral Commission',
            amount: 150,
            status: 'completed',
            date: '2025-01-18T14:30:00',
            description: 'Commission from John D. subscription'
        },
        {
            id: '2',
            type: 'debit',
            source: 'M-Pesa Withdrawal',
            amount: 5000,
            status: 'completed',
            date: '2025-01-17T10:15:00',
            description: 'Withdrawal to +254 712 345 678'
        },
        {
            id: '3',
            type: 'credit',
            source: 'Escort Booking',
            amount: 2400,
            status: 'completed',
            date: '2025-01-16T18:45:00',
            description: 'VIP escort booking payment'
        },
        {
            id: '4',
            type: 'credit',
            source: 'Profile Unlock',
            amount: 90,
            status: 'completed',
            date: '2025-01-16T12:20:00',
            description: 'User unlocked your contact'
        },
        {
            id: '5',
            type: 'credit',
            source: 'Referral Commission',
            amount: 90,
            status: 'pending',
            date: '2025-01-15T16:00:00',
            description: 'Commission from Mike T. unlock'
        },
        {
            id: '6',
            type: 'credit',
            source: 'Escort Booking',
            amount: 8000,
            status: 'completed',
            date: '2025-01-15T20:30:00',
            description: 'Premium booking payment'
        },
        {
            id: '7',
            type: 'debit',
            source: 'M-Pesa Withdrawal',
            amount: 10000,
            status: 'completed',
            date: '2025-01-14T09:00:00',
            description: 'Withdrawal to +254 712 345 678'
        },
        {
            id: '8',
            type: 'credit',
            source: 'Referral Commission',
            amount: 2400,
            status: 'completed',
            date: '2025-01-13T11:30:00',
            description: 'Commission from Sarah K. VIP upgrade'
        }
    ],
    stats: {
        thisMonth: {
            earned: 12650,
            withdrawn: 15000,
            referrals: 4500
        },
        lastMonth: {
            earned: 18200,
            withdrawn: 12000,
            referrals: 6200
        }
    }
}

export default function WalletPage() {
    const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all')
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')

    const filteredTransactions = MOCK_WALLET_DATA.transactions.filter(transaction => {
        const matchesType = filterType === 'all' || transaction.type === filterType
        const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus
        return matchesType && matchesStatus
    })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dating"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">My Wallet</h1>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-6 h-6" />
                            <span className="text-sm text-purple-100">Available Balance</span>
                        </div>
                        <h2 className="text-5xl font-bold mb-6">
                            KSh {MOCK_WALLET_DATA.balance.toLocaleString()}
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-purple-100 text-sm mb-1">Pending</p>
                                <p className="text-2xl font-bold">
                                    KSh {MOCK_WALLET_DATA.pendingEarnings.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-purple-100 text-sm mb-1">Total Earned</p>
                                <p className="text-2xl font-bold">
                                    KSh {MOCK_WALLET_DATA.totalEarnings.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/wallet/cashout"
                                className="flex-1 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowUpRight className="w-5 h-5" />
                                <span>Withdraw</span>
                            </Link>
                            <Link
                                href="/referral"
                                className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Gift className="w-5 h-5" />
                                <span>Earn More</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">This Month</span>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            KSh {MOCK_WALLET_DATA.stats.thisMonth.earned.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Total earned</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Withdrawn</span>
                            <ArrowUpRight className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            KSh {MOCK_WALLET_DATA.stats.thisMonth.withdrawn.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">This month</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Referrals</span>
                            <Gift className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            KSh {MOCK_WALLET_DATA.stats.thisMonth.referrals.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Commission earned</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Link
                        href="/profile/escort"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <DollarSign className="w-8 h-8 text-pink-500" />
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Escort Earnings</h3>
                        <p className="text-sm text-gray-600">Manage your bookings</p>
                    </Link>

                    <Link
                        href="/referral"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Gift className="w-8 h-8 text-purple-500" />
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Referral Program</h3>
                        <p className="text-sm text-gray-600">Earn 30% commission</p>
                    </Link>
                </div>

                {/* Transactions Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterType('credit')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'credit'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Income
                                </button>
                                <button
                                    onClick={() => setFilterType('debit')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'debit'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Withdrawals
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="divide-y divide-gray-100">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.type === 'credit'
                                                    ? 'bg-green-100'
                                                    : 'bg-red-100'
                                                }`}>
                                                {transaction.type === 'credit' ? (
                                                    <ArrowDownRight className={`w-6 h-6 ${transaction.type === 'credit'
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                        }`} />
                                                ) : (
                                                    <ArrowUpRight className="w-6 h-6 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {transaction.source}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {transaction.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(transaction.date)}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${transaction.status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {transaction.status === 'completed' ? (
                                                            <Check className="w-3 h-3" />
                                                        ) : (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-bold ${transaction.type === 'credit'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}>
                                                {transaction.type === 'credit' ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-2">No transactions found</p>
                                <p className="text-sm text-gray-500">
                                    Adjust your filters to see more transactions
                                </p>
                            </div>
                        )}
                    </div>

                    {filteredTransactions.length > 0 && (
                        <div className="p-6 border-t border-gray-200">
                            <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                Load More Transactions
                            </button>
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        Need Help?
                    </h4>
                    <p className="text-sm text-blue-800 mb-4">
                        If you have any questions about your wallet or transactions, contact our support team.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm">
                        Contact Support
                    </button>
                </div>
            </main>
        </div>
    )
}
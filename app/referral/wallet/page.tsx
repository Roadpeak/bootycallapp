// app/referral/wallet/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Wallet, TrendingUp, DollarSign, Gift,
    ArrowUpRight, ArrowDownRight, Clock, Check, X,
    CreditCard, Smartphone, ExternalLink, ChevronRight,
    Download, Filter, Loader2
} from 'lucide-react'
import { useWallet } from '@/lib/hooks/butical-api-hooks'

export default function WalletPage() {
    const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all')

    // Fetch wallet data from API
    const { wallet, transactions, loading, error, refetchTransactions } = useWallet()

    // Compute values from API data
    const balance = wallet?.currentBalance || wallet?.balance || 0
    const pendingEarnings = wallet?.pendingWithdrawals || 0
    const totalEarnings = wallet?.totalEarnings || 0

    const filteredTransactions = transactions.filter(transaction => {
        if (filterType === 'all') return true
        if (filterType === 'credit') return transaction.type === 'EARNING' || transaction.type === 'REFERRAL_CREDIT'
        if (filterType === 'debit') return transaction.type === 'WITHDRAWAL'
        return true
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

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'EARNING':
            case 'REFERRAL_CREDIT':
                return <ArrowDownRight className="w-6 h-6 text-green-600" />
            case 'WITHDRAWAL':
                return <ArrowUpRight className="w-6 h-6 text-red-600" />
            default:
                return <DollarSign className="w-6 h-6 text-gray-600" />
        }
    }

    const isCredit = (type: string) => type === 'EARNING' || type === 'REFERRAL_CREDIT' || type === 'REFUND'

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/referral"
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
                            KSh {balance.toLocaleString()}
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-purple-100 text-sm mb-1">Pending</p>
                                <p className="text-2xl font-bold">
                                    KSh {pendingEarnings.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-purple-100 text-sm mb-1">Total Earned</p>
                                <p className="text-2xl font-bold">
                                    KSh {totalEarnings.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/referral/cashout"
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
                            <span className="text-sm text-gray-600">Total Earned</span>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            KSh {totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">All time earnings</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Withdrawn</span>
                            <ArrowUpRight className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            KSh {(wallet?.totalWithdrawals || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Total withdrawn</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Pending</span>
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            KSh {pendingEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Pending withdrawals</p>
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
                        <p className="text-sm text-gray-600">Earn 50% commission</p>
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
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCredit(transaction.type)
                                                    ? 'bg-green-100'
                                                    : 'bg-red-100'
                                                }`}>
                                                {getTransactionIcon(transaction.type)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {transaction.type.replace(/_/g, ' ')}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {transaction.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(transaction.createdAt)}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${transaction.status === 'COMPLETED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : transaction.status === 'PENDING'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {transaction.status === 'COMPLETED' ? (
                                                            <Check className="w-3 h-3" />
                                                        ) : (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {transaction.status.toLowerCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-bold ${isCredit(transaction.type)
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}>
                                                {isCredit(transaction.type) ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
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
                                    {filterType === 'all'
                                        ? 'Your transactions will appear here'
                                        : 'Adjust your filters to see more transactions'}
                                </p>
                            </div>
                        )}
                    </div>

                    {filteredTransactions.length > 0 && (
                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => refetchTransactions({ page: 1, limit: 20 })}
                                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
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

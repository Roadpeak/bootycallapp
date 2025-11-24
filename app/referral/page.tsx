// app/referral/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Copy, Share2, DollarSign, Users, TrendingUp,
    Check, Gift, Facebook, Twitter, Mail, MessageCircle,
    ChevronRight, ExternalLink, Wallet, ArrowUpRight, Loader2
} from 'lucide-react'
import { useReferrals, useWallet } from '@/lib/hooks/butical-api-hooks'

export default function ReferralPage() {
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')

    // Fetch referral and wallet data from API
    const { referralCode, myReferrals, totalEarnings, loading: referralsLoading } = useReferrals()
    const { wallet, loading: walletLoading } = useWallet()

    const isLoading = referralsLoading || walletLoading

    // Compute values from API data
    const referralLink = referralCode ? `https://lovebite.app/signup?ref=${referralCode}` : ''
    const availableBalance = wallet?.currentBalance || wallet?.balance || 0
    const pendingEarnings = wallet?.pendingWithdrawals || 0
    const totalReferralsCount = myReferrals.length

    const handleCopyCode = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleCopyLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleShare = (platform: string) => {
        const text = `Join LoveBite and get premium access! Use my referral code: ${referralCode || ''}`
        const url = referralLink

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`)
                break
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
                break
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
                break
            case 'email':
                window.location.href = `mailto:?subject=Join LoveBite&body=${encodeURIComponent(text + '\n\n' + url)}`
                break
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
                            href="/dating"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Referral Program</h1>
                        <Link
                            href="/referral/wallet"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Wallet className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Hero Banner */}
                <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-pink-600 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Gift className="w-8 h-8" />
                            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                                Earn 30% Commission
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Invite Friends & Earn Money!</h2>
                        <p className="text-pink-100 text-lg mb-6 max-w-2xl">
                            Share your referral code and earn 30% commission on all qualifying payments from your referrals.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-pink-100 text-sm mb-1">Total Earnings</p>
                                <p className="text-3xl font-bold">
                                    KSh {totalEarnings.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-pink-100 text-sm mb-1">Available Balance</p>
                                <p className="text-3xl font-bold">
                                    KSh {availableBalance.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-pink-100 text-sm mb-1">Total Referrals</p>
                                <p className="text-3xl font-bold">{totalReferralsCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Wallet Integration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Link
                        href="/referral/wallet"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-2 border-purple-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-purple-600" />
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">View Wallet</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            See all your transactions and earnings
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                            KSh {availableBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Available balance</p>
                    </Link>

                    <Link
                        href="/referral/cashout"
                        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-white"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-white" />
                            </div>
                            <ChevronRight className="w-6 h-6 text-white/80" />
                        </div>
                        <h3 className="font-bold mb-1">Withdraw Funds</h3>
                        <p className="text-sm text-green-100 mb-3">
                            Transfer to your M-Pesa account
                        </p>
                        <p className="text-xs text-green-200">
                            Minimum: KSh 1,000
                        </p>
                    </Link>
                </div>

                {/* Referral Code Section */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Referral Code</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Referral Code
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg font-mono text-xl font-bold text-gray-900 flex items-center justify-between">
                                <span>{referralCode || 'Loading...'}</span>
                                {copied && <Check className="w-5 h-5 text-green-500" />}
                            </div>
                            <button
                                onClick={handleCopyCode}
                                disabled={!referralCode}
                                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Copy className="w-5 h-5" />
                                <span className="hidden md:inline">Copy</span>
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Referral Link
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm text-gray-700 truncate">
                                {referralLink || 'Loading...'}
                            </div>
                            <button
                                onClick={handleCopyLink}
                                disabled={!referralLink}
                                className="px-6 py-3 border-2 border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Copy className="w-5 h-5" />
                                <span className="hidden md:inline">Copy Link</span>
                            </button>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Share via
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>WhatsApp</span>
                            </button>
                            <button
                                onClick={() => handleShare('facebook')}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Facebook className="w-5 h-5" />
                                <span>Facebook</span>
                            </button>
                            <button
                                onClick={() => handleShare('twitter')}
                                className="px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Twitter className="w-5 h-5" />
                                <span>Twitter</span>
                            </button>
                            <button
                                onClick={() => handleShare('email')}
                                className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                <span>Email</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Share Your Code</h4>
                                <p className="text-gray-600 text-sm">
                                    Share your unique referral code or link with friends via WhatsApp, SMS, or social media.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Friends Sign Up</h4>
                                <p className="text-gray-600 text-sm">
                                    When they sign up using your code, they get linked to your account automatically.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Earn Commission</h4>
                                <p className="text-gray-600 text-sm">
                                    You earn 30% on every payment they make (subscriptions, unlocks, VIP upgrades).
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                4
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Withdraw Anytime</h4>
                                <p className="text-gray-600 text-sm">
                                    Request withdrawals to your M-Pesa account once you reach the minimum balance of KSh 1,000.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings Breakdown</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-green-700">Available</span>
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-900">
                                KSh {availableBalance.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 mt-1">Ready to withdraw</p>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-yellow-700">Pending</span>
                                <TrendingUp className="w-5 h-5 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-900">
                                KSh {pendingEarnings.toLocaleString()}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">Under verification</p>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-blue-700">Total Referrals</span>
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-900">
                                {totalReferralsCount}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">People you referred</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link
                            href="/referral/wallet"
                            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <Wallet className="w-5 h-5" />
                            <span>View Full Wallet</span>
                        </Link>
                        <Link
                            href="/referral/cashout"
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowUpRight className="w-5 h-5" />
                            <span>Withdraw Now</span>
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'overview'
                                        ? 'text-pink-600 border-b-2 border-pink-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'history'
                                        ? 'text-pink-600 border-b-2 border-pink-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Referrals ({totalReferralsCount})
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' ? (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Performance Overview</h4>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            KSh {totalEarnings.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Available</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            KSh {availableBalance.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {totalReferralsCount}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h5 className="font-semibold text-blue-900 mb-2">Pro Tips</h5>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li>Share your code on social media for maximum reach</li>
                                        <li>Target people interested in dating or entertainment services</li>
                                        <li>Explain the benefits of the platform when sharing</li>
                                        <li>The more referrals, the more you earn!</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Your Referrals</h4>

                                {myReferrals.length > 0 ? (
                                    <div className="space-y-3">
                                        {myReferrals.map((referral) => (
                                            <div
                                                key={referral.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-900">{referral.displayName}</h5>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Joined {new Date(referral.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 mb-2">No referrals yet</p>
                                        <p className="text-sm text-gray-500">
                                            Share your code to start earning!
                                        </p>
                                    </div>
                                )}

                                <Link
                                    href="/referral/wallet"
                                    className="block w-full mt-4 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-center"
                                >
                                    View All in Wallet
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Terms */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Terms & Conditions
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                        <li>30% commission applies to all qualifying payments (subscriptions, unlocks, VIP)</li>
                        <li>Earnings are verified within 24-48 hours after payment</li>
                        <li>Minimum withdrawal amount is KSh 1,000</li>
                        <li>Fraudulent referrals will result in account suspension</li>
                        <li>Commission rates may change with prior notice</li>
                    </ul>
                </div>
            </main>
        </div>
    )
}

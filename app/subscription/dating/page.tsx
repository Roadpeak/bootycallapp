// app/subscription/dating/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Heart, Check, Star, Zap, Crown, Shield,
    Gift, ChevronRight, X, Clock, AlertCircle, Sparkles
} from 'lucide-react'

// Dating subscription plans
const DATING_PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        price: 499,
        duration: '1 Month',
        features: [
            '50 Likes per day',
            'See who likes you',
            'Basic matching',
            'Standard support'
        ],
        popular: false
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 999,
        duration: '1 Month',
        features: [
            'Unlimited Likes',
            'See who likes you',
            'Advanced matching',
            'Priority support',
            'Boost profile weekly',
            'Free escort unlocks (5/month)'
        ],
        popular: true
    },
    {
        id: 'vip',
        name: 'VIP',
        price: 2499,
        duration: '3 Months',
        features: [
            'Everything in Premium',
            'Unlimited escort unlocks',
            'Profile verification badge',
            'VIP support',
            'Daily profile boosts',
            'Exclusive events access'
        ],
        popular: false
    }
]

// Mock current subscription
const CURRENT_SUBSCRIPTION = {
    plan: 'premium',
    status: 'active', // 'active', 'expired', 'expiring_soon'
    expiresAt: '2025-01-25',
    startedAt: '2024-12-25',
    autoRenew: false
}

export default function DatingSubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'wallet' | 'card'>('mpesa')
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [referralCode, setReferralCode] = useState('')
    const [autoRenew, setAutoRenew] = useState(CURRENT_SUBSCRIPTION.autoRenew)

    // Mock wallet balance
    const walletBalance = 1500

    const getDaysRemaining = () => {
        const expiry = new Date(CURRENT_SUBSCRIPTION.expiresAt)
        const now = new Date()
        const diff = expiry.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const isExpiringSoon = () => {
        return getDaysRemaining() <= 7 && getDaysRemaining() > 0
    }

    const isExpired = () => {
        return getDaysRemaining() <= 0
    }

    const getSelectedPlanDetails = () => {
        return DATING_PLANS.find(plan => plan.id === selectedPlan)
    }

    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId)
        setShowPaymentModal(true)
    }

    const handlePayment = async () => {
        if (!selectedPlan) return

        setIsProcessing(true)
        setPaymentStatus('pending')

        try {
            await new Promise(resolve => setTimeout(resolve, 3000))
            setPaymentStatus('success')

            setTimeout(() => {
                setShowPaymentModal(false)
            }, 2000)
        } catch (error) {
            setPaymentStatus('failed')
        } finally {
            setIsProcessing(false)
        }
    }

    const toggleAutoRenew = async () => {
        // TODO: API call to toggle auto-renew
        setAutoRenew(!autoRenew)
    }

    const isCurrentPlan = (planId: string) => {
        return CURRENT_SUBSCRIPTION.plan === planId && !isExpired()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/profile/dating"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Subscription</h1>
                        <Link
                            href="/wallet"
                            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                        >
                            Wallet
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Current Subscription Status - Active */}
                {!isExpired() && !isExpiringSoon() && (
                    <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                    <Heart className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {DATING_PLANS.find(p => p.id === CURRENT_SUBSCRIPTION.plan)?.name} Plan
                                    </h2>
                                    <p className="text-pink-100">
                                        {getDaysRemaining()} days remaining • Expires {new Date(CURRENT_SUBSCRIPTION.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleAutoRenew}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${autoRenew
                                            ? 'bg-white/20 text-white hover:bg-white/30'
                                            : 'bg-white text-pink-600 hover:bg-pink-50'
                                        }`}
                                >
                                    {autoRenew ? '✓ Auto-renew ON' : 'Enable Auto-renew'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expiring Soon Warning */}
                {isExpiringSoon() && (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold mb-1">Subscription Expiring Soon!</h2>
                                <p className="text-yellow-100">
                                    Your {DATING_PLANS.find(p => p.id === CURRENT_SUBSCRIPTION.plan)?.name} plan expires in {getDaysRemaining()} days.
                                    Renew now to keep your matches and continue swiping!
                                </p>
                            </div>
                            <button
                                onClick={() => handleSelectPlan(CURRENT_SUBSCRIPTION.plan)}
                                className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
                            >
                                Renew Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Expired Notice */}
                {isExpired() && (
                    <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                                <Clock className="w-7 h-7 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold mb-1">Subscription Expired</h2>
                                <p className="text-gray-300">
                                    Your subscription has expired. Renew to continue matching and access all features.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isExpired() ? 'Reactivate Your Subscription' : 'Manage Your Subscription'}
                    </h2>
                    <p className="text-gray-600">
                        {isExpired()
                            ? 'Choose a plan to continue your dating journey'
                            : 'Upgrade your plan or renew your current subscription'
                        }
                    </p>
                </div>

                {/* Subscription Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {DATING_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-xl overflow-hidden transition-all ${isCurrentPlan(plan.id)
                                    ? 'ring-2 ring-pink-500 shadow-lg'
                                    : 'border border-gray-200 hover:shadow-lg'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute top-0 left-0 right-0 py-2 text-center text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500">
                                    Most Popular
                                </div>
                            )}

                            {/* Current Plan Badge */}
                            {isCurrentPlan(plan.id) && (
                                <div className="absolute top-3 right-3">
                                    <span className="bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                        Current
                                    </span>
                                </div>
                            )}

                            <div className={`p-6 ${plan.popular ? 'pt-12' : ''}`}>
                                {/* Plan Icon */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${plan.id === 'basic' ? 'bg-gray-100' :
                                        plan.id === 'premium' ? 'bg-pink-100' : 'bg-purple-100'
                                    }`}>
                                    {plan.id === 'basic' && <Star className="w-7 h-7 text-gray-600" />}
                                    {plan.id === 'premium' && <Zap className="w-7 h-7 text-pink-600" />}
                                    {plan.id === 'vip' && <Crown className="w-7 h-7 text-purple-600" />}
                                </div>

                                {/* Plan Name & Price */}
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{plan.duration}</p>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        KSh {plan.price.toLocaleString()}
                                    </span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.id === 'basic' ? 'text-gray-500' :
                                                    plan.id === 'premium' ? 'text-pink-500' : 'text-purple-500'
                                                }`} />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${isCurrentPlan(plan.id)
                                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                                            : plan.id === 'basic'
                                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                : plan.id === 'premium'
                                                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                                                    : 'bg-purple-500 text-white hover:bg-purple-600'
                                        }`}
                                >
                                    {isCurrentPlan(plan.id) ? 'Renew' : isExpired() ? 'Subscribe' : 'Upgrade'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscription History */}
                <div className="bg-white rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Details</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Current Plan</span>
                            <span className="font-medium text-gray-900">
                                {DATING_PLANS.find(p => p.id === CURRENT_SUBSCRIPTION.plan)?.name}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Status</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isExpired()
                                    ? 'bg-red-100 text-red-700'
                                    : isExpiringSoon()
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                }`}>
                                {isExpired() ? 'Expired' : isExpiringSoon() ? 'Expiring Soon' : 'Active'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Started</span>
                            <span className="font-medium text-gray-900">
                                {new Date(CURRENT_SUBSCRIPTION.startedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Expires</span>
                            <span className="font-medium text-gray-900">
                                {new Date(CURRENT_SUBSCRIPTION.expiresAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600">Auto-renew</span>
                            <button
                                onClick={toggleAutoRenew}
                                className={`relative w-12 h-6 rounded-full transition-colors ${autoRenew ? 'bg-pink-500' : 'bg-gray-300'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoRenew ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Referral Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Gift className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">Invite Friends & Earn</h3>
                            <p className="text-sm text-gray-600">
                                Share your referral code and earn 30% commission on every subscription!
                            </p>
                        </div>
                        <Link
                            href="/referral"
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                        >
                            Get Code
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isCurrentPlan(selectedPlan || '') ? 'Renew Subscription' : 'Upgrade Subscription'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false)
                                        setPaymentStatus('idle')
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Selected Plan Summary */}
                            <div className="bg-pink-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {getSelectedPlanDetails()?.name} Plan
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {getSelectedPlanDetails()?.duration}
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-pink-600">
                                        KSh {getSelectedPlanDetails()?.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Referral Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-green-500" />
                                        Referral Code (Optional)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                    placeholder="Enter referral code"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('mpesa')}
                                        className={`p-3 rounded-lg border-2 transition-colors ${paymentMethod === 'mpesa'
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-green-300'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mx-auto mb-1">
                                                M
                                            </div>
                                            <span className="text-xs font-medium">M-Pesa</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('wallet')}
                                        className={`p-3 rounded-lg border-2 transition-colors ${paymentMethod === 'wallet'
                                                ? 'border-pink-500 bg-pink-50'
                                                : 'border-gray-200 hover:border-pink-300'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white mx-auto mb-1">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-medium">Wallet</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        disabled
                                        className="p-3 rounded-lg border-2 border-gray-200 opacity-50 cursor-not-allowed"
                                    >
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white mx-auto mb-1">
                                                💳
                                            </div>
                                            <span className="text-xs font-medium text-gray-400">Card</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Payment Details */}
                            {paymentMethod === 'mpesa' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        M-Pesa Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={mpesaPhone}
                                        onChange={(e) => setMpesaPhone(e.target.value)}
                                        placeholder="+254 7XX XXX XXX"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You'll receive an STK push on this number
                                    </p>
                                </div>
                            )}

                            {paymentMethod === 'wallet' && (
                                <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Wallet Balance</span>
                                        <span className="font-bold text-pink-600">
                                            KSh {walletBalance.toLocaleString()}
                                        </span>
                                    </div>
                                    {walletBalance < (getSelectedPlanDetails()?.price || 0) && (
                                        <div>
                                            <p className="text-sm text-red-600 mb-2">
                                                Insufficient balance. Please top up or use M-Pesa.
                                            </p>
                                            <Link
                                                href="/wallet/topup"
                                                className="text-sm text-pink-600 font-medium hover:underline"
                                            >
                                                Top up wallet →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Auto-renew Option */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <p className="font-medium text-gray-900">Enable Auto-renew</p>
                                        <p className="text-sm text-gray-500">
                                            Automatically renew when subscription expires
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={autoRenew}
                                        onChange={() => setAutoRenew(!autoRenew)}
                                        className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                </label>
                            </div>

                            {/* Payment Status */}
                            {paymentStatus === 'pending' && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-yellow-800 font-medium">Processing payment...</p>
                                    {paymentMethod === 'mpesa' && (
                                        <p className="text-yellow-600 text-sm">Check your phone for M-Pesa prompt</p>
                                    )}
                                </div>
                            )}

                            {paymentStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-green-800 font-medium">Payment successful!</p>
                                    <p className="text-green-600 text-sm">Your subscription has been renewed</p>
                                </div>
                            )}

                            {paymentStatus === 'failed' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                                    <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-800 font-medium">Payment failed</p>
                                    <p className="text-red-600 text-sm">Please try again</p>
                                </div>
                            )}

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={
                                    isProcessing ||
                                    paymentStatus === 'success' ||
                                    (paymentMethod === 'wallet' && walletBalance < (getSelectedPlanDetails()?.price || 0)) ||
                                    (paymentMethod === 'mpesa' && !mpesaPhone)
                                }
                                className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>Pay KSh {getSelectedPlanDetails()?.price.toLocaleString()}</>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By completing this payment, you agree to our Terms of Service
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
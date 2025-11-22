// app/subscription/escort/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Crown, Check, Star, Zap, Shield, Eye, TrendingUp,
    Gift, Phone, ChevronRight, Sparkles, X
} from 'lucide-react'

// Escort subscription plans
const ESCORT_PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 999,
        duration: '1 Month',
        features: [
            'Basic profile listing',
            'Up to 4 photos',
            'Standard visibility',
            'Basic analytics',
            'Email support'
        ],
        highlight: null,
        color: 'gray'
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 2499,
        duration: '1 Month',
        features: [
            'Priority profile listing',
            'Up to 8 photos',
            'Enhanced visibility',
            'Detailed analytics',
            'Priority support',
            'Profile verification badge',
            'Weekly profile boost'
        ],
        highlight: 'Most Popular',
        color: 'purple'
    },
    {
        id: 'vip',
        name: 'VIP Elite',
        price: 4999,
        duration: '1 Month',
        features: [
            'Top profile placement',
            'Unlimited photos',
            'Maximum visibility',
            'Advanced analytics dashboard',
            '24/7 VIP support',
            'Verified VIP badge',
            'Daily profile boosts',
            'Featured in homepage',
            'Priority in search results',
            'Exclusive VIP events'
        ],
        highlight: 'Best Value',
        color: 'gold'
    }
]

// Mock current subscription
const CURRENT_SUBSCRIPTION = {
    plan: 'professional',
    status: 'active',
    expiresAt: '2025-02-15',
    autoRenew: true
}

export default function EscortSubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'wallet' | 'card'>('mpesa')
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [referralCode, setReferralCode] = useState('')

    // Mock wallet balance
    const walletBalance = 3500

    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId)
        setShowPaymentModal(true)
    }

    const getSelectedPlanDetails = () => {
        return ESCORT_PLANS.find(plan => plan.id === selectedPlan)
    }

    const handlePayment = async () => {
        if (!selectedPlan) return

        setIsProcessing(true)
        setPaymentStatus('pending')

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000))
            setPaymentStatus('success')

            setTimeout(() => {
                setShowPaymentModal(false)
                // Redirect or update UI
            }, 2000)
        } catch (error) {
            setPaymentStatus('failed')
        } finally {
            setIsProcessing(false)
        }
    }

    const getDaysRemaining = () => {
        const expiry = new Date(CURRENT_SUBSCRIPTION.expiresAt)
        const now = new Date()
        const diff = expiry.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const isCurrentPlan = (planId: string) => {
        return CURRENT_SUBSCRIPTION.plan === planId && CURRENT_SUBSCRIPTION.status === 'active'
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/profile/escort"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Subscription</h1>
                        <Link
                            href="/wallet"
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Wallet
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Current Subscription Status */}
                {CURRENT_SUBSCRIPTION.status === 'active' && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                    <Crown className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {ESCORT_PLANS.find(p => p.id === CURRENT_SUBSCRIPTION.plan)?.name} Plan
                                    </h2>
                                    <p className="text-purple-100">
                                        {getDaysRemaining()} days remaining • Expires {new Date(CURRENT_SUBSCRIPTION.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${CURRENT_SUBSCRIPTION.autoRenew
                                        ? 'bg-green-500/20 text-green-100'
                                        : 'bg-yellow-500/20 text-yellow-100'
                                    }`}>
                                    {CURRENT_SUBSCRIPTION.autoRenew ? 'Auto-renew ON' : 'Auto-renew OFF'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Subscription Banner */}
                {CURRENT_SUBSCRIPTION.status !== 'active' && (
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-1">Boost Your Visibility</h2>
                                <p className="text-gray-300">
                                    Subscribe now to get more clients and increase your earnings!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {CURRENT_SUBSCRIPTION.status === 'active' ? 'Upgrade or Renew' : 'Choose Your Plan'}
                    </h2>
                    <p className="text-gray-600">
                        Get more visibility, more clients, and earn more money
                    </p>
                </div>

                {/* Benefits Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">More Visibility</p>
                        <p className="text-xs text-gray-500">Get seen by more clients</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Higher Earnings</p>
                        <p className="text-xs text-gray-500">VIPs earn 3x more</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Verified Badge</p>
                        <p className="text-xs text-gray-500">Build client trust</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Phone className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Priority Support</p>
                        <p className="text-xs text-gray-500">24/7 assistance</p>
                    </div>
                </div>

                {/* Subscription Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {ESCORT_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-xl overflow-hidden transition-all ${isCurrentPlan(plan.id)
                                    ? 'ring-2 ring-purple-500 shadow-lg'
                                    : 'border border-gray-200 hover:shadow-lg'
                                }`}
                        >
                            {/* Highlight Badge */}
                            {plan.highlight && (
                                <div className={`absolute top-0 left-0 right-0 py-2 text-center text-sm font-semibold text-white ${plan.color === 'purple' ? 'bg-purple-500' :
                                        plan.color === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                            'bg-gray-500'
                                    }`}>
                                    {plan.highlight}
                                </div>
                            )}

                            <div className={`p-6 ${plan.highlight ? 'pt-12' : ''}`}>
                                {/* Plan Icon */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${plan.color === 'gray' ? 'bg-gray-100' :
                                        plan.color === 'purple' ? 'bg-purple-100' :
                                            'bg-yellow-100'
                                    }`}>
                                    {plan.id === 'starter' && <Star className="w-7 h-7 text-gray-600" />}
                                    {plan.id === 'professional' && <Zap className="w-7 h-7 text-purple-600" />}
                                    {plan.id === 'vip' && <Crown className="w-7 h-7 text-yellow-600" />}
                                </div>

                                {/* Plan Name & Price */}
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{plan.duration}</p>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        KSh {plan.price.toLocaleString()}
                                    </span>
                                    <span className="text-gray-500">/month</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.color === 'gray' ? 'text-gray-500' :
                                                    plan.color === 'purple' ? 'text-purple-500' :
                                                        'text-yellow-500'
                                                }`} />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Button */}
                                {isCurrentPlan(plan.id) ? (
                                    <button
                                        disabled
                                        className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold"
                                    >
                                        Current Plan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.color === 'gray'
                                                ? 'bg-gray-900 text-white hover:bg-gray-800' :
                                                plan.color === 'purple'
                                                    ? 'bg-purple-500 text-white hover:bg-purple-600' :
                                                    'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                                            }`}
                                    >
                                        {CURRENT_SUBSCRIPTION.status === 'active' ? 'Upgrade' : 'Subscribe'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Referral Bonus */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Gift className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">Refer & Earn</h3>
                            <p className="text-sm text-gray-600">
                                Earn 30% commission when you refer other escorts. Share your referral code and earn passive income!
                            </p>
                        </div>
                        <Link
                            href="/referral"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                            Start Earning
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">Can I upgrade my plan anytime?</h4>
                            <p className="text-sm text-gray-600">
                                Yes! You can upgrade at any time. You'll only pay the difference for the remaining period.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">What happens when my subscription expires?</h4>
                            <p className="text-sm text-gray-600">
                                Your profile will become less visible. You can renew anytime to restore full visibility.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">Can I cancel my subscription?</h4>
                            <p className="text-sm text-gray-600">
                                You can turn off auto-renewal anytime. Your subscription will remain active until the end of the paid period.
                            </p>
                        </div>
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
                                <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
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
                            <div className="bg-purple-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {getSelectedPlanDetails()?.name} Plan
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {getSelectedPlanDetails()?.duration}
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-purple-600">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white mx-auto mb-1">
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
                                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Wallet Balance</span>
                                        <span className="font-bold text-purple-600">
                                            KSh {walletBalance.toLocaleString()}
                                        </span>
                                    </div>
                                    {walletBalance < (getSelectedPlanDetails()?.price || 0) && (
                                        <p className="text-sm text-red-600">
                                            Insufficient balance. Please top up or use M-Pesa.
                                        </p>
                                    )}
                                </div>
                            )}

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
                                    <p className="text-green-600 text-sm">Your subscription is now active</p>
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
                                className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
// app/referral/cashout/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Smartphone, AlertCircle, Check, Loader2,
    DollarSign, Clock, Shield, Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/hooks/butical-api-hooks'

const MINIMUM_WITHDRAWAL = 100

export default function CashoutPage() {
    const router = useRouter()
    const [amount, setAmount] = useState('')
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Fetch wallet data from API
    const { wallet, withdraw, loading: walletLoading } = useWallet()

    const availableBalance = wallet?.currentBalance || wallet?.balance || 0

    const handleQuickAmount = (value: number) => {
        setAmount(value.toString())
        setError('')
    }

    const validateWithdrawal = () => {
        const withdrawalAmount = parseFloat(amount)

        if (!amount || withdrawalAmount <= 0) {
            setError('Please enter a valid amount')
            return false
        }

        if (withdrawalAmount < MINIMUM_WITHDRAWAL) {
            setError(`Minimum withdrawal is KSh ${MINIMUM_WITHDRAWAL.toLocaleString()}`)
            return false
        }

        if (withdrawalAmount > availableBalance) {
            setError('Insufficient balance')
            return false
        }

        if (!mpesaPhone.trim()) {
            setError('Please enter your M-Pesa phone number')
            return false
        }

        const phoneRegex = /^(\+254|254|0)[17]\d{8}$/
        if (!phoneRegex.test(mpesaPhone.replace(/\s/g, ''))) {
            setError('Please enter a valid Kenyan phone number')
            return false
        }

        return true
    }

    const handleWithdrawal = async () => {
        if (!validateWithdrawal()) return

        setIsProcessing(true)
        setError('')

        try {
            const result = await withdraw(parseFloat(amount), mpesaPhone.replace(/\s/g, ''))

            if (result.success) {
                setSuccess(true)
                // Redirect to wallet after 3 seconds
                setTimeout(() => {
                    router.push('/referral/wallet')
                }, 3000)
            } else {
                setError(result.error || 'Withdrawal failed. Please try again.')
            }
        } catch (err: any) {
            setError(err.message || 'Withdrawal failed. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (walletLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Withdrawal Initiated!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        KSh {parseFloat(amount).toLocaleString()} withdrawal request to {mpesaPhone} has been submitted.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-orange-900 mb-1">
                                    Payment Schedule - Friday Only
                                </p>
                                <p className="text-sm text-orange-800">
                                    All payments are processed on Fridays. You will receive your M-Pesa payment on the next Friday.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/referral/wallet"
                        className="block w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors"
                    >
                        Back to Wallet
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/referral/wallet"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Withdraw Funds</h1>
                        <div className="w-20"></div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                {/* Balance Display */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 mb-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-6 h-6" />
                        <span className="text-sm text-purple-100">Available to Withdraw</span>
                    </div>
                    <h2 className="text-5xl font-bold">
                        KSh {availableBalance.toLocaleString()}
                    </h2>
                </div>

                {/* Withdrawal Form */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Withdrawal Details</h3>

                    {/* Amount Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Withdraw (KSh) *
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">
                                KSh
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                    setError('')
                                }}
                                placeholder="0"
                                className="w-full pl-16 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Minimum withdrawal: KSh {MINIMUM_WITHDRAWAL.toLocaleString()}
                        </p>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Quick Select
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[100, 500, 1000, 5000].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => handleQuickAmount(value)}
                                    disabled={value > availableBalance}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${value > availableBalance
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                >
                                    {value >= 1000 ? `${value / 1000}K` : `KSh ${value}`}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handleQuickAmount(availableBalance)}
                            disabled={availableBalance < MINIMUM_WITHDRAWAL}
                            className="w-full mt-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Withdraw All
                        </button>
                    </div>

                    {/* M-Pesa Phone Number */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            M-Pesa Phone Number *
                        </label>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={mpesaPhone}
                                onChange={(e) => {
                                    setMpesaPhone(e.target.value)
                                    setError('')
                                }}
                                placeholder="+254 712 345 678"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Enter the M-Pesa number where you want to receive funds
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Withdrawal Button */}
                    <button
                        onClick={handleWithdrawal}
                        disabled={isProcessing || availableBalance < MINIMUM_WITHDRAWAL}
                        className="w-full px-6 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing Withdrawal...</span>
                            </>
                        ) : (
                            <>
                                <Smartphone className="w-5 h-5" />
                                <span>Withdraw to M-Pesa</span>
                            </>
                        )}
                    </button>

                    {isProcessing && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 text-center">
                                Please wait while we process your withdrawal request...
                            </p>
                        </div>
                    )}
                </div>

                {/* Information Cards */}
                <div className="space-y-4">
                    {/* Friday Payment Notice */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl shadow-sm p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    Payment Schedule - Friday Only
                                </h4>
                                <p className="text-sm text-gray-800 font-medium mb-2">
                                    All payments are processed on Fridays only. If you withdraw on any other day, you will need to wait until Friday to receive your cash.
                                </p>
                                <p className="text-xs text-gray-600">
                                    Please plan your withdrawals accordingly.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Secure Transactions</h4>
                                <p className="text-sm text-gray-600">
                                    All withdrawals are secured with bank-level encryption.
                                    Your money is transferred directly to your M-Pesa account.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Important Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Info className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Important Information</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>No withdrawal fees charged</li>
                                    <li>Minimum withdrawal: KSh {MINIMUM_WITHDRAWAL.toLocaleString()}</li>
                                    <li>Maximum per transaction: KSh 150,000</li>
                                    <li>Daily withdrawal limit: KSh 300,000</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Having issues with withdrawal?
                    </p>
                    <button className="text-purple-600 font-medium text-sm hover:text-purple-700">
                        Contact Support
                    </button>
                </div>
            </main>
        </div>
    )
}

// app/auth/signup/hookup/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Users, Eye, EyeOff, AlertCircle, X } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { HookupUserRegistration } from '@/services/butical-api-service'

export default function HookupSignupPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsProcessing(true)

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match')
            }

            // Validate required fields
            if (!formData.firstName || !formData.lastName || !formData.email ||
                !formData.phone || !formData.password) {
                throw new Error('Please fill in all required fields')
            }

            if (formData.password.length < 6) {
                throw new Error('Password must be at least 6 characters')
            }

            if (!formData.termsAccepted) {
                throw new Error('Please accept the terms and conditions')
            }

            // Prepare registration data
            const registrationData: HookupUserRegistration = {
                email: formData.email.trim(),
                phone: formData.phone.replace(/\s+/g, ''), // Remove spaces
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                role: 'HOOKUP_USER',
                termsAccepted: formData.termsAccepted,
            }

            // Register user
            const response = await ButicalAPI.auth.register(registrationData)
            console.log('Registration response:', response)

            // API returns { status, data: { user, accessToken, refreshToken } }
            const authData = response.data?.data

            // Store tokens if available
            if (authData?.accessToken) {
                TokenService.setAccessToken(authData.accessToken)
                if (authData.refreshToken) {
                    TokenService.setRefreshToken(authData.refreshToken)
                }
            }

            // Always redirect after successful registration
            console.log('Redirecting to /escorts')
            window.location.href = '/escorts'
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center py-8 px-4">
            <div className="max-w-md w-full">
                {/* Error Display */}
                {error && (
                    <div className="mb-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm flex-1">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Quick Signup
                    </h1>
                    <p className="text-gray-600">
                        Create an account for faster hookup access
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="your@email.com"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                placeholder="254712345678"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Create a strong password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 mr-3 w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-rose-500 hover:text-rose-600">
                                        Terms & Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-rose-500 hover:text-rose-600">
                                        Privacy Policy
                                    </Link>{' '}
                                    *
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full px-4 py-2.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-rose-500 hover:text-rose-600 font-medium">
                                    Log in
                                </Link>
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <Link href="/hookups" className="text-sm text-gray-600 hover:text-gray-800">
                                ← Continue browsing without an account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
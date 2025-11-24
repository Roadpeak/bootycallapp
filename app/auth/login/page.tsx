// app/auth/login/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Heart, Eye, EyeOff, AlertCircle, X } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'

export default function LoginPage() {
    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: '',
        rememberMe: false,
    })

    const [showPassword, setShowPassword] = useState(false)
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
            // Validate required fields
            if (!formData.emailOrPhone || !formData.password) {
                throw new Error('Please fill in all fields')
            }

            // Prepare login credentials
            const credentials = {
                email: formData.emailOrPhone.trim(),
                password: formData.password,
            }

            // Call login API
            const response = await ButicalAPI.auth.login(credentials)
            console.log('Login response:', response)

            // API returns { status, data: { user, accessToken, refreshToken } }
            const authData = response.data?.data

            // Store tokens if available
            if (authData?.accessToken) {
                TokenService.setAccessToken(authData.accessToken)
                if (authData.refreshToken) {
                    TokenService.setRefreshToken(authData.refreshToken)
                }
            }

            // Redirect based on user role
            const userRole = authData?.user?.role
            let redirectPath = '/'

            switch (userRole) {
                case 'DATING_USER':
                    redirectPath = '/dating'
                    break
                case 'ESCORT':
                    redirectPath = '/profile/escort'
                    break
                case 'HOOKUP_USER':
                    redirectPath = '/escorts'
                    break
                case 'ADMIN':
                    redirectPath = '/admin'
                    break
                default:
                    redirectPath = '/'
            }

            // Use window.location for reliable redirect after auth state change
            console.log('Redirecting to:', redirectPath)
            window.location.href = redirectPath
        } catch (err: any) {
            console.error('Login error:', err)

            // Handle specific error messages
            if (err.response?.status === 401) {
                setError('Invalid email/phone or password. Please try again.')
            } else if (err.response?.status === 404) {
                setError('No account found with this email/phone. Please sign up first.')
            } else if (err.response?.status === 429) {
                setError('Too many login attempts. Please try again later.')
            } else {
                setError(err.response?.data?.message || err.message || 'Login failed. Please try again.')
            }
        } finally {
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
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Log in to continue your journey
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email or Phone Number
                            </label>
                            <input
                                type="text"
                                name="emailOrPhone"
                                value={formData.emailOrPhone}
                                onChange={handleInputChange}
                                required
                                placeholder="your@email.com or 254712345678"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                disabled={isProcessing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    disabled={isProcessing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    disabled={isProcessing}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                                    disabled={isProcessing}
                                />
                                <span className="ml-2 text-sm text-gray-700">Remember me</span>
                            </label>

                            <Link href="/auth/forgot-password" className="text-sm text-pink-500 hover:text-pink-600">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full px-4 py-2.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Logging in...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <Link href="/auth/signup/dating" className="block">
                                <button
                                    type="button"
                                    className="w-full px-4 py-2.5 border border-pink-300 text-pink-600 rounded-lg hover:bg-pink-50 font-medium transition-colors"
                                    disabled={isProcessing}
                                >
                                    Sign up for Dating
                                </button>
                            </Link>

                            <Link href="/auth/signup/escort" className="block">
                                <button
                                    type="button"
                                    className="w-full px-4 py-2.5 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
                                    disabled={isProcessing}
                                >
                                    Join as an Escort
                                </button>
                            </Link>

                            <Link href="/auth/signup/hookup" className="block">
                                <button
                                    type="button"
                                    className="w-full px-4 py-2.5 border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 font-medium transition-colors"
                                    disabled={isProcessing}
                                >
                                    Quick User Signup
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Browse without account */}
                <div className="mt-6 text-center">
                    <Link href="/escorts" className="text-sm text-gray-600 hover:text-gray-800">
                        Or continue browsing escorts without an account →
                    </Link>
                </div>
            </div>
        </div>
    )
}
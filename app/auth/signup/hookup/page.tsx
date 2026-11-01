// app/auth/signup/hookup/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Users, Eye, EyeOff } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { HookupUserRegistration } from '@/services/butical-api-service'
import { toMpesaPhone } from '@/lib/utils/phone'
import { FieldError, StepErrorSummary } from '@/app/components/forms/FieldError'
import {
    collect, focusFirstError, required, validateEmail, validateKenyanPhone,
    validatePassword, validatePasswordMatch, type FieldErrors,
} from '@/lib/signup/validators'
import { parseSignupError, type FieldMap } from '@/lib/signup/errors'

const FIELD_ORDER = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'termsAccepted']

const FIELD_LABELS: Record<string, string> = {
    firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Phone',
    password: 'Password', confirmPassword: 'Confirm password', termsAccepted: 'Terms',
}

/** API field -> form field (one step only). */
const HOOKUP_FIELD_MAP: FieldMap = Object.fromEntries(
    ['firstName', 'lastName', 'email', 'phone', 'password', 'termsAccepted'].map(f => [f, { field: f, step: 1 }]),
)

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
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFieldErrors(prev => {
            if (!prev[name]) return prev
            const next = { ...prev }
            delete next[name]
            return next
        })
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const errors = collect({
            firstName: required(formData.firstName, 'First name'),
            lastName: required(formData.lastName, 'Last name'),
            email: validateEmail(formData.email),
            phone: validateKenyanPhone(formData.phone),
            password: validatePassword(formData.password),
            confirmPassword: validatePasswordMatch(formData.password, formData.confirmPassword),
            termsAccepted: formData.termsAccepted ? null : 'Accept the terms to continue',
        })
        setFieldErrors(errors)
        if (Object.keys(errors).length) {
            const count = Object.keys(errors).length
            setError(count > 1 ? `Please fix ${count} things below.` : Object.values(errors)[0])
            focusFirstError(errors, FIELD_ORDER)
            return
        }

        setIsProcessing(true)

        try {
            // Prepare registration data
            const registrationData: HookupUserRegistration = {
                email: formData.email.trim(),
                phone: toMpesaPhone(formData.phone),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                role: 'HOOKUP_USER',
                termsAccepted: formData.termsAccepted,
            }

            // Register user
            const response = await ButicalAPI.auth.register(registrationData)
            console.log('Registration response:', response)

            // API returns { status, data: { tokens: { accessToken, refreshToken }, user: {...} } }
            const authData = response.data?.data

            // Extract tokens - they might be nested in a 'tokens' object
            const accessToken = authData?.tokens?.accessToken || authData?.accessToken
            const refreshToken = authData?.tokens?.refreshToken || authData?.refreshToken

            // Store tokens if available
            if (accessToken) {
                TokenService.setAccessToken(accessToken)
                if (refreshToken) {
                    TokenService.setRefreshToken(refreshToken)
                }
            }

            // Always redirect after successful registration
            console.log('Redirecting to /escorts')
            window.location.href = '/escorts'
        } catch (err: any) {
            console.error('Registration error:', err)
            const problem = parseSignupError(err, HOOKUP_FIELD_MAP, 'Registration failed. Please try again.')
            setFieldErrors(problem.fieldErrors)
            setError(problem.message)
            focusFirstError(problem.fieldErrors, FIELD_ORDER)
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center py-8 px-4">
            <div className="max-w-md w-full">
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
                    <StepErrorSummary
                        message={error}
                        errors={fieldErrors}
                        labels={FIELD_LABELS}
                        onDismiss={() => setError(null)}
                    />
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName" aria-invalid={!!fieldErrors.firstName}
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="given-name"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                                <FieldError message={fieldErrors.firstName} />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName" aria-invalid={!!fieldErrors.lastName}
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="family-name"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                                <FieldError message={fieldErrors.lastName} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email" aria-invalid={!!fieldErrors.email}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                autoComplete="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                            <FieldError message={fieldErrors.email} />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone" aria-invalid={!!fieldErrors.phone}
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                autoComplete="tel"
                                placeholder="254712345678"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                            <FieldError message={fieldErrors.phone} />
                            <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX</p>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password" aria-invalid={!!fieldErrors.password}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="new-password"
                                    placeholder="Create a strong password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <FieldError message={fieldErrors.password} />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword" aria-invalid={!!fieldErrors.confirmPassword}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="new-password"
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <FieldError message={fieldErrors.confirmPassword} />
                        </div>

                        <div className="pt-2">
                            <label htmlFor="termsAccepted" className="flex items-start">
                                <input
                                    id="termsAccepted"
                                    type="checkbox"
                                    name="termsAccepted" aria-invalid={!!fieldErrors.termsAccepted}
                                    checked={formData.termsAccepted}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 mr-3 w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link href="/legal/terms" className="text-rose-500 hover:text-rose-600">
                                        Terms & Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/legal/privacy" className="text-rose-500 hover:text-rose-600">
                                        Privacy Policy
                                    </Link>{' '}
                                    *
                                </span>
                            </label>
                            <FieldError message={fieldErrors.termsAccepted} />
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
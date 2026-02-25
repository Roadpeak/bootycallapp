// app/auth/signup/dating/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Upload, X, Eye, EyeOff, Check, Crown, Star, Shield, Zap, Gift, AlertCircle } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { DatingUserRegistration } from '@/services/butical-api-service'

// Subscription plan - Dating Premium (KSh 300/year)
const SUBSCRIPTION_PLAN = {
    id: 'premium',
    name: 'Dating Premium',
    price: 300,
    duration: '1 Year',
    features: [
        'Unlimited Likes',
        'See who likes you',
        'Advanced matching',
        'Priority support',
        'Boost profile weekly',
        'Free escort unlocks (5/month)'
    ]
}

function DatingSignupPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        displayName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: '',
        sexualOrientation: '',
        city: '',
        country: 'Kenya',
        lookingFor: '',
        bio: '',
        interests: [] as string[],
        education: '',
        occupation: '',
        referralCode: '',
        termsAccepted: false,
        ageConfirmed: false,
    })

    // Auto-fill referral code from URL query parameter
    useEffect(() => {
        const refCode = searchParams.get('ref')
        if (refCode) {
            setFormData(prev => ({ ...prev, referralCode: refCode }))
        }
    }, [searchParams])

    const [photos, setPhotos] = useState<File[]>([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle')
    const [error, setError] = useState<string | null>(null)

    const interestOptions = [
        'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking',
        'Fitness', 'Photography', 'Dancing', 'Gaming', 'Art', 'Fashion',
        'Nature', 'Technology', 'Food', 'Pets', 'Yoga', 'Hiking'
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files).slice(0, 6 - photos.length)
            setPhotos(prev => [...prev, ...newPhotos])
        }
    }

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
    }

    // Convert phone number from 07... to 254...
    const convertPhoneTo254 = (phone: string): string => {
        const cleanedPhone = phone.replace(/\s+/g, '')
        if (cleanedPhone.startsWith('0')) {
            return '254' + cleanedPhone.substring(1)
        }
        return cleanedPhone
    }

    // Convert files to base64
    const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
        const promises = files.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => {
                    const base64 = reader.result as string
                    // Remove data:image/xxx;base64, prefix
                    const base64Data = base64.split(',')[1]
                    resolve(base64Data)
                }
                reader.onerror = reject
                reader.readAsDataURL(file)
            })
        })
        return Promise.all(promises)
    }

    const handleRegistration = async () => {
        setError(null)
        setIsProcessing(true)

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match')
            }

            // Validate required fields
            if (!formData.firstName || !formData.lastName || !formData.email ||
                !formData.phone || !formData.password || !formData.gender ||
                !formData.dateOfBirth || !formData.bio || !formData.lookingFor) {
                throw new Error('Please fill in all required fields')
            }

            if (photos.length === 0) {
                throw new Error('Please upload at least one photo')
            }

            if (formData.interests.length < 3) {
                throw new Error('Please select at least 3 interests')
            }

            if (!formData.ageConfirmed || !formData.termsAccepted) {
                throw new Error('Please accept the terms and confirm your age')
            }

            // Convert photos to base64
            const photoBase64 = await convertFilesToBase64(photos)

            // Prepare registration data
            const registrationData: DatingUserRegistration = {
                email: formData.email.trim(),
                phone: convertPhoneTo254(formData.phone),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                role: 'DATING_USER',
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                bio: formData.bio.trim(),
                termsAccepted: formData.termsAccepted,
                ageConfirmed: formData.ageConfirmed,
                displayName: formData.displayName.trim() || undefined,
                sexualOrientation: formData.sexualOrientation || undefined,
                location: formData.city.trim() ? {
                    city: formData.city.trim(),
                    country: formData.country || 'Kenya'
                } : undefined,
                lookingFor: formData.lookingFor || undefined,
                interests: formData.interests,
                education: formData.education.trim() || undefined,
                occupation: formData.occupation.trim() || undefined,
                referralCode: formData.referralCode.trim() || undefined,
                photos: photoBase64,
            }

            // Register user
            const response = await ButicalAPI.auth.register(registrationData)
            console.log('Registration response:', response)

            // API returns { status, data: { tokens: { accessToken, refreshToken }, user: {...} } }
            const authData = response.data?.data

            // Extract tokens - they might be nested in a 'tokens' object
            const accessToken = authData?.tokens?.accessToken || authData?.accessToken
            const refreshToken = authData?.tokens?.refreshToken || authData?.refreshToken

            if (accessToken) {
                // Store tokens
                TokenService.setAccessToken(accessToken)
                if (refreshToken) {
                    TokenService.setRefreshToken(refreshToken)
                }

                // Process payment for Premium subscription
                await handlePayment()
            } else {
                // Registration successful but no token - still redirect
                console.log('No token in response, redirecting anyway')
                router.push('/dating')
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
            setIsProcessing(false)
        }
    }

    const handlePayment = async () => {
        setPaymentStatus('pending')

        try {
            const phoneNumber = convertPhoneTo254(mpesaPhone || formData.phone)

            // Validate phone format (254XXXXXXXXX)
            if (!/^254\d{9}$/.test(phoneNumber)) {
                throw new Error('Invalid phone format. Use 07XXXXXXXX or 254XXXXXXXXX')
            }

            console.log('Initiating M-Pesa payment for phone:', phoneNumber)

            // Initiate payment - this sends the STK push
            const paymentResponse = await ButicalAPI.payments.subscribeDating(phoneNumber)
            console.log('Payment initiation response:', paymentResponse)

            if (paymentResponse?.data) {
                // Extract payment ID from response
                const paymentData = paymentResponse.data?.data || paymentResponse.data
                const paymentId = paymentData?.paymentId

                console.log('Extracted payment data:', paymentData)
                console.log('Payment ID for status polling:', paymentId)

                if (!paymentId) {
                    console.error('No payment ID received from payment initiation')
                    throw new Error('Payment initiation failed - no payment ID received')
                }

                if (paymentId) {
                    // Poll for payment status every 2 seconds for up to 60 seconds
                    let attempts = 0
                    const maxAttempts = 30
                    const pollInterval = 2000

                    const checkPaymentStatus = async (): Promise<boolean> => {
                        try {
                            const statusResponse = await ButicalAPI.payments.getPaymentStatus(paymentId)
                            const status = statusResponse.data?.data?.status || statusResponse.data?.status

                            console.log(`Payment status check (${attempts + 1}/${maxAttempts}):`, status)

                            if (status === 'SUCCESS' || (status as string) === 'COMPLETED') {
                                setPaymentStatus('success')
                                // Clear tokens and redirect to login for a clean login experience
                                TokenService.clearTokens()
                                setTimeout(() => {
                                    router.push('/auth/login?registered=true')
                                }, 1500)
                                return true
                            } else if (status === 'FAILED' || status === 'CANCELLED') {
                                throw new Error('Payment was cancelled or failed')
                            }

                            // Still pending, continue polling
                            return false
                        } catch (err) {
                            console.error('Error checking payment status:', err)
                            return false
                        }
                    }

                    // Start polling
                    const pollForCompletion = async () => {
                        while (attempts < maxAttempts) {
                            attempts++
                            const completed = await checkPaymentStatus()

                            if (completed) {
                                return
                            }

                            // Wait before next poll
                            await new Promise(resolve => setTimeout(resolve, pollInterval))
                        }

                        // Timeout - payment took too long
                        throw new Error('Payment verification timed out. Please check your M-Pesa messages and contact support if payment was deducted.')
                    }

                    await pollForCompletion()
                } else {
                    // STK push sent successfully, redirect even without polling
                    setPaymentStatus('success')
                    setTimeout(() => {
                        router.push('/dating')
                    }, 2000)
                }
            }
        } catch (error: any) {
            console.error('Payment error:', error)
            setPaymentStatus('failed')

            // Extract detailed error message from API response
            const errorMessage = error.response?.data?.message ||
                               error.response?.data?.error ||
                               error.message ||
                               'Payment failed. Please try again.'

            setError(`Payment failed: ${errorMessage}`)

            // Don't clear tokens - user account exists and they can retry payment
            // The account is inactive until payment succeeds, but tokens are still valid for retry
        } finally {
            setIsProcessing(false)
        }
    }

    // Retry payment function
    const handleRetryPayment = async () => {
        setError(null)
        setPaymentStatus('idle')
        setIsProcessing(true)

        // User account already exists and tokens are still valid
        // Just retry the payment without re-registering
        await handlePayment()
    }

    const nextStep = () => {
        setError(null)

        // Validate current step before proceeding
        if (currentStep === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email ||
                !formData.phone || !formData.password || !formData.gender ||
                !formData.dateOfBirth || !formData.lookingFor) {
                setError('Please fill in all required fields')
                return
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match')
                return
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters')
                return
            }
        } else if (currentStep === 2) {
            if (!formData.city || !formData.bio || formData.interests.length < 3) {
                setError('Please complete all required fields (minimum 3 interests)')
                return
            }
        } else if (currentStep === 3) {
            if (photos.length === 0) {
                setError('Please upload at least one photo')
                return
            }
            if (!formData.ageConfirmed || !formData.termsAccepted) {
                setError('Please accept the terms and confirm your age')
                return
            }
        }

        setCurrentStep(prev => Math.min(prev + 1, 4))
    }

    const prevStep = () => {
        setError(null)
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
            {/* Error Display */}
            {error && (
                <div className="max-w-3xl mx-auto mb-4">
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

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Join Our Dating Community
                    </h1>
                    <p className="text-gray-600">Find your perfect match today</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-lg mx-auto">
                        {[1, 2, 3, 4].map((step) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep >= step
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {currentStep > step ? <Check className="w-5 h-5" /> : step}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 text-center">
                                        {step === 1 ? 'Basic' : step === 2 ? 'Profile' : step === 3 ? 'Photos' : 'Plan'}
                                    </span>
                                </div>
                                {step < 4 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded ${currentStep > step ? 'bg-pink-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        autoComplete="given-name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        autoComplete="family-name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name (Optional)
                                </label>
                                <input
                                    id="displayName"
                                    type="text"
                                    name="displayName"
                                    autoComplete="nickname"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="How you want others to see you"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0712345678"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX</p>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    id="dateOfBirth"
                                    type="date"
                                    name="dateOfBirth"
                                    autoComplete="bday"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        autoComplete="sex"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="sexualOrientation" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sexual Orientation
                                    </label>
                                    <select
                                        id="sexualOrientation"
                                        name="sexualOrientation"
                                        value={formData.sexualOrientation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    >
                                        <option value="">Select orientation</option>
                                        <option value="straight">Straight</option>
                                        <option value="gay">Gay</option>
                                        <option value="lesbian">Lesbian</option>
                                        <option value="bisexual">Bisexual</option>
                                        <option value="pansexual">Pansexual</option>
                                        <option value="asexual">Asexual</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Looking For *
                                </label>
                                <select
                                    id="lookingFor"
                                    name="lookingFor"
                                    value={formData.lookingFor}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                >
                                    <option value="">What are you looking for?</option>
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                    <option value="everyone">Everyone</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-pink-500" />
                                        Referral Code (Optional)
                                    </span>
                                </label>
                                <input
                                    id="referralCode"
                                    type="text"
                                    name="referralCode"
                                    autoComplete="off"
                                    value={formData.referralCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter referral code if you have one"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Using a referral code? Your friend will earn commission on your subscription!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Profile Details */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City / Location *
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        name="city"
                                        autoComplete="address-level2"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nairobi"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country *
                                    </label>
                                    <input
                                        id="country"
                                        type="text"
                                        name="country"
                                        autoComplete="country-name"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                    About Me *
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interests (Select at least 3) *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {interestOptions.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.interests.includes(interest)
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                                    Education (Optional)
                                </label>
                                <input
                                    id="education"
                                    type="text"
                                    name="education"
                                    autoComplete="off"
                                    value={formData.education}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Bachelor's Degree"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                                    Occupation (Optional)
                                </label>
                                <input
                                    id="occupation"
                                    type="text"
                                    name="occupation"
                                    autoComplete="organization-title"
                                    value={formData.occupation}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Software Engineer"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Photos */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Photos</h2>

                            <div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Add at least one photo to continue. You can add up to 6 photos.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={URL.createObjectURL(photo)}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {photos.length < 6 && (
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-pink-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Upload Photo</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <label htmlFor="ageConfirmed" className="flex items-start cursor-pointer">
                                    <input
                                        id="ageConfirmed"
                                        type="checkbox"
                                        name="ageConfirmed"
                                        checked={formData.ageConfirmed}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 mr-3 w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I confirm that I am 18 years or older *
                                    </span>
                                </label>

                                <label htmlFor="termsAccepted" className="flex items-start cursor-pointer">
                                    <input
                                        id="termsAccepted"
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 mr-3 w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I agree to the{' '}
                                        <Link href="/legal/terms" className="text-pink-500 hover:text-pink-600">
                                            Terms & Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/legal/privacy" className="text-pink-500 hover:text-pink-600">
                                            Privacy Policy
                                        </Link>{' '}
                                        *
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Payment */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Registration</h2>
                                <p className="text-gray-600">
                                    Subscribe to Dating Premium and start matching!
                                </p>
                            </div>

                            {/* Subscription Plan Display */}
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-300">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-pink-500 rounded-full flex items-center justify-center">
                                        <Zap className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{SUBSCRIPTION_PLAN.name}</h3>
                                    <p className="text-sm text-gray-600">{SUBSCRIPTION_PLAN.duration}</p>
                                </div>

                                <div className="text-center mb-6">
                                    <span className="text-4xl font-bold text-pink-600">
                                        KSh {SUBSCRIPTION_PLAN.price.toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 text-sm ml-2">/year</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {SUBSCRIPTION_PLAN.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Payment Section */}
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="mpesaPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                            M-Pesa Phone Number
                                        </label>
                                        <input
                                            id="mpesaPhone"
                                            type="tel"
                                            name="mpesaPhone"
                                            autoComplete="tel"
                                            value={mpesaPhone || formData.phone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                            placeholder="0712345678"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            You will receive an M-Pesa STK push on this number (Format: 07XXXXXXXX)
                                        </p>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="mt-6 p-4 bg-white rounded-lg border">
                                    <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">{SUBSCRIPTION_PLAN.name}</span>
                                        <span className="font-medium">
                                            KSh {SUBSCRIPTION_PLAN.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                                        <span>Duration</span>
                                        <span>{SUBSCRIPTION_PLAN.duration}</span>
                                    </div>
                                    {formData.referralCode && (
                                        <div className="flex justify-between items-center text-sm text-green-600">
                                            <span className="flex items-center gap-1">
                                                <Gift className="w-4 h-4" />
                                                Referral Applied
                                            </span>
                                            <span>{formData.referralCode}</span>
                                        </div>
                                    )}
                                    <div className="border-t mt-3 pt-3">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-pink-600">
                                                KSh {SUBSCRIPTION_PLAN.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Status */}
                                {paymentStatus === 'pending' && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        <p className="text-yellow-800 font-medium">
                                            Waiting for M-Pesa confirmation...
                                        </p>
                                        <p className="text-yellow-600 text-sm">
                                            Please check your phone and enter your M-Pesa PIN
                                        </p>
                                    </div>
                                )}

                                {paymentStatus === 'success' && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                        <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                        <p className="text-green-800 font-medium">
                                            Payment successful!
                                        </p>
                                        <p className="text-green-600 text-sm">
                                            Redirecting to your dashboard...
                                        </p>
                                    </div>
                                )}

                                {paymentStatus === 'failed' && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                                        <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                        <p className="text-red-800 font-medium">
                                            Payment failed
                                        </p>
                                        <p className="text-red-600 text-sm mb-4">
                                            {error || 'Please try again or contact support'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleRetryPayment}
                                            disabled={isProcessing}
                                            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : 'Try Again'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={isProcessing}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                Previous
                            </button>
                        ) : (
                            <Link href="/">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </Link>
                        )}

                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={isProcessing}
                                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors disabled:opacity-50"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleRegistration}
                                disabled={isProcessing || paymentStatus === 'success'}
                                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Processing...
                                    </>
                                ) : (
                                    `Complete & Pay KSh ${SUBSCRIPTION_PLAN.price.toLocaleString()}`
                                )}
                            </button>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-pink-500 hover:text-pink-600 font-medium">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DatingSignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <DatingSignupPageContent />
        </Suspense>
    )
}
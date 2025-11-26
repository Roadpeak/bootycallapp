// app/auth/signup/dating/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Heart, Upload, X, Eye, EyeOff, Check, Crown, Star, Shield, Zap, Gift, AlertCircle } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { DatingUserRegistration } from '@/services/butical-api-service'

// Subscription plans
const SUBSCRIPTION_PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        price: 0,
        duration: 'Free',
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
        price: 300,
        duration: '1 Year',
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
        price: 3000,
        duration: '1 Year',
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

export default function DatingSignupPage() {
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

    const [photos, setPhotos] = useState<File[]>([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedPlan, setSelectedPlan] = useState<string | null>('basic')
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa')
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
                phone: formData.phone.replace(/\s+/g, ''), // Remove spaces
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
                city: formData.city.trim() || undefined,
                country: formData.country || undefined,
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

                // If subscription selected (not basic), process payment
                if (selectedPlan && selectedPlan !== 'basic') {
                    await handlePayment()
                } else {
                    // Redirect to dating page for basic plan
                    console.log('Redirecting to /dating')
                    window.location.href = '/dating'
                }
            } else {
                // Registration successful but no token - still redirect
                console.log('No token in response, redirecting anyway')
                window.location.href = '/dating'
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
            setIsProcessing(false)
        }
    }

    const handlePayment = async () => {
        if (!selectedPlan || selectedPlan === 'basic') return

        setPaymentStatus('pending')

        try {
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)
            if (!plan) throw new Error('Invalid plan selected')

            const phoneNumber = (mpesaPhone || formData.phone).replace(/\s+/g, '')

            // Validate phone format (254XXXXXXXXX)
            if (!/^254\d{9}$/.test(phoneNumber)) {
                throw new Error('Invalid phone format. Use 254XXXXXXXXX')
            }

            // Call appropriate payment endpoint
            let paymentResponse
            if (selectedPlan === 'premium') {
                paymentResponse = await ButicalAPI.payments.subscribeDating(phoneNumber)
            } else if (selectedPlan === 'vip') {
                paymentResponse = await ButicalAPI.payments.subscribeVIP(phoneNumber)
            }

            if (paymentResponse?.data) {
                setPaymentStatus('success')

                // Redirect after success
                setTimeout(() => {
                    window.location.href = '/dating'
                }, 2000)
            }
        } catch (error: any) {
            console.error('Payment error:', error)
            setPaymentStatus('failed')
            setError(error.response?.data?.message || 'Payment failed. You can upgrade later from your profile.')

            // Still allow user to proceed after payment failure
            setTimeout(() => {
                window.location.href = '/dating'
            }, 3000)
        } finally {
            setIsProcessing(false)
        }
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

    const getSelectedPlanDetails = () => {
        return SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="How you want others to see you"
                                />
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sexual Orientation
                                    </label>
                                    <select
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Looking For *
                                </label>
                                <select
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-pink-500" />
                                        Referral Code (Optional)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    name="referralCode"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nairobi"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    About Me *
                                </label>
                                <textarea
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Education (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Bachelor's Degree"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Occupation (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="occupation"
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
                                <label className="flex items-start">
                                    <input
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

                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 mr-3 w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-pink-500 hover:text-pink-600">
                                            Terms & Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="text-pink-500 hover:text-pink-600">
                                            Privacy Policy
                                        </Link>{' '}
                                        *
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Subscription */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                                <p className="text-gray-600">
                                    Select a subscription to complete your registration and start matching!
                                </p>
                            </div>

                            {/* Subscription Plans */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {SUBSCRIPTION_PLANS.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative rounded-xl p-6 cursor-pointer transition-all ${selectedPlan === plan.id
                                                ? 'border-2 border-pink-500 bg-pink-50 shadow-lg'
                                                : 'border-2 border-gray-200 hover:border-pink-300'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        <div className="text-center mb-4">
                                            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${plan.id === 'basic' ? 'bg-gray-100' :
                                                    plan.id === 'premium' ? 'bg-pink-100' : 'bg-purple-100'
                                                }`}>
                                                {plan.id === 'basic' && <Star className="w-6 h-6 text-gray-600" />}
                                                {plan.id === 'premium' && <Zap className="w-6 h-6 text-pink-600" />}
                                                {plan.id === 'vip' && <Crown className="w-6 h-6 text-purple-600" />}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                            <p className="text-sm text-gray-500">{plan.duration}</p>
                                        </div>

                                        <div className="text-center mb-4">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {plan.price === 0 ? 'Free' : `KSh ${plan.price.toLocaleString()}`}
                                            </span>
                                        </div>

                                        <ul className="space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {selectedPlan === plan.id && (
                                            <div className="absolute top-3 right-3">
                                                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Payment Section */}
                            {selectedPlan && selectedPlan !== 'basic' && (
                                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>

                                    {/* Payment Method Selection */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('mpesa')}
                                            className={`p-4 rounded-lg border-2 transition-colors ${paymentMethod === 'mpesa'
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-green-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    M
                                                </div>
                                                <span className="font-semibold">M-Pesa</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-4 rounded-lg border-2 transition-colors ${paymentMethod === 'card'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Shield className="w-6 h-6 text-blue-600" />
                                                <span className="font-semibold">Card</span>
                                            </div>
                                        </button>
                                    </div>

                                    {paymentMethod === 'mpesa' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    M-Pesa Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={mpesaPhone || formData.phone}
                                                    onChange={(e) => setMpesaPhone(e.target.value)}
                                                    placeholder="254712345678"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    You will receive an M-Pesa STK push on this number
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'card' && (
                                        <div className="text-center py-6 text-gray-500">
                                            Card payment coming soon. Please use M-Pesa for now.
                                        </div>
                                    )}

                                    {/* Order Summary */}
                                    <div className="mt-6 p-4 bg-white rounded-lg border">
                                        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">{getSelectedPlanDetails()?.name} Plan</span>
                                            <span className="font-medium">
                                                KSh {getSelectedPlanDetails()?.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                                            <span>Duration</span>
                                            <span>{getSelectedPlanDetails()?.duration}</span>
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
                                                    KSh {getSelectedPlanDetails()?.price.toLocaleString()}
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
                                            <p className="text-red-600 text-sm">
                                                Please try again or use a different payment method
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                ) : selectedPlan !== 'basic' ? (
                                    `Complete & Pay KSh ${getSelectedPlanDetails()?.price.toLocaleString() || '0'}`
                                ) : (
                                    'Complete Registration'
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
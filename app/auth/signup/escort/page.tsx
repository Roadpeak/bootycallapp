// app/auth/signup/escort/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Upload, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { EscortRegistration } from '@/services/butical-api-service'

function EscortSignupPageContent() {
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
        contactPhone: '',
        city: '',
        area: '',
        description: '',
        languages: [] as string[],
        hourlyRate: '',
        mpesaPhone: '',
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
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle')

    // Services state
    const [selectedServices, setSelectedServices] = useState<string[]>([])

    // Availability state
    const [availability, setAvailability] = useState({
        monday: { available: false, from: '', to: '' },
        tuesday: { available: false, from: '', to: '' },
        wednesday: { available: false, from: '', to: '' },
        thursday: { available: false, from: '', to: '' },
        friday: { available: false, from: '', to: '' },
        saturday: { available: false, from: '', to: '' },
        sunday: { available: false, from: '', to: '' },
    })

    const serviceOptions = [
        'Massage',
        'Girlfriend Experience (GFE)',
        'Oral',
        'Blowjob',
        'Anal',
        'Pegging',
        'BDSM',
        'Role Play',
        'Threesome',
        'Couple Service',
        'Dinner Date',
        'Travel Companion',
        'Fetish',
        'Domination',
        'Submission',
        'Strip Tease',
        'Overnight',
    ]

    const languageOptions = [
        'English',
        'Swahili',
        'French',
        'Spanish',
        'Arabic',
        'German',
        'Italian',
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

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        )
    }

    const toggleLanguage = (language: string) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.includes(language)
                ? prev.languages.filter(l => l !== language)
                : [...prev.languages, language]
        }))
    }

    const toggleDayAvailability = (day: keyof typeof availability) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                available: !prev[day].available
            }
        }))
    }

    const updateDayTime = (day: keyof typeof availability, field: 'from' | 'to', value: string) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files).slice(0, 4 - photos.length)
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
            if (!formData.firstName || !formData.lastName || !formData.displayName ||
                !formData.email || !formData.phone || !formData.password ||
                !formData.contactPhone || !formData.description) {
                throw new Error('Please fill in all required fields')
            }

            if (photos.length === 0) {
                throw new Error('Please upload at least one photo')
            }

            if (formData.languages.length === 0) {
                throw new Error('Please select at least one language')
            }

            if (selectedServices.length === 0) {
                throw new Error('Please select at least one service')
            }

            if (!formData.ageConfirmed || !formData.termsAccepted) {
                throw new Error('Please accept the terms and confirm your age')
            }

            // Convert photos to base64
            const photoBase64 = await convertFilesToBase64(photos)

            // Transform availability from day-by-day object to backend format { days: string[], hours: string }
            const availableDays = Object.entries(availability)
                .filter(([_, schedule]) => schedule.available)
                .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1)) // Capitalize: "monday" -> "Monday"

            // Get hours from the first available day (or default)
            const firstAvailableDay = Object.entries(availability).find(([_, schedule]) => schedule.available)
            const hours = firstAvailableDay
                ? `${firstAvailableDay[1].from || '09:00'} - ${firstAvailableDay[1].to || '21:00'}`
                : '09:00 - 21:00'

            // Transform services from string[] to { name: string }[]
            const servicesFormatted = selectedServices.map(name => ({ name }))

            // Prepare registration data with correct backend format
            const registrationData: any = {
                email: formData.email.trim(),
                phone: convertPhoneTo254(formData.phone),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                role: 'ESCORT',
                contactPhone: convertPhoneTo254(formData.contactPhone),
                about: formData.description.trim(),
                languages: formData.languages,
                displayName: formData.displayName.trim() || undefined,
                referralCode: formData.referralCode.trim() || undefined,
                photos: photoBase64,
                // Backend expects location as object with city and area properties
                location: formData.city.trim() ? {
                    city: formData.city.trim(),
                    area: formData.area.trim() || undefined
                } : undefined,
                // Backend expects services as array of objects with name property
                services: servicesFormatted.length > 0 ? servicesFormatted : undefined,
                // Backend expects pricing as object with hourlyRate
                pricing: formData.hourlyRate ? { hourlyRate: parseFloat(formData.hourlyRate) } : undefined,
                // Backend expects availability as { days: string[], hours: string }
                availability: availableDays.length > 0 ? { days: availableDays, hours } : undefined,
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

                // Process payment for VIP subscription
                await handlePayment()
            } else {
                // Registration successful but no token - still redirect
                console.log('No token in response, redirecting anyway')
                router.push('/profile/escort')
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
            setIsProcessing(false)
        }
    }

    const handleSkipPayment = async () => {
        setError(null)
        setIsProcessing(true)

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match')
            }

            // Validate required fields
            if (!formData.firstName || !formData.lastName || !formData.displayName ||
                !formData.email || !formData.phone || !formData.password ||
                !formData.contactPhone || !formData.description) {
                throw new Error('Please fill in all required fields')
            }

            if (photos.length === 0) {
                throw new Error('Please upload at least one photo')
            }

            if (formData.languages.length === 0) {
                throw new Error('Please select at least one language')
            }

            if (selectedServices.length === 0) {
                throw new Error('Please select at least one service')
            }

            if (!formData.ageConfirmed || !formData.termsAccepted) {
                throw new Error('Please accept the terms and confirm your age')
            }

            // Convert photos to base64
            const photoBase64 = await convertFilesToBase64(photos)

            // Transform availability from day-by-day object to backend format { days: string[], hours: string }
            const availableDays = Object.entries(availability)
                .filter(([_, schedule]) => schedule.available)
                .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))

            const firstAvailableDay = Object.entries(availability).find(([_, schedule]) => schedule.available)
            const hours = firstAvailableDay
                ? `${firstAvailableDay[1].from || '09:00'} - ${firstAvailableDay[1].to || '21:00'}`
                : '09:00 - 21:00'

            const servicesFormatted = selectedServices.map(name => ({ name }))

            const registrationData: any = {
                email: formData.email.trim(),
                phone: convertPhoneTo254(formData.phone),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                role: 'ESCORT',
                contactPhone: convertPhoneTo254(formData.contactPhone),
                about: formData.description.trim(),
                languages: formData.languages,
                displayName: formData.displayName.trim() || undefined,
                referralCode: formData.referralCode.trim() || undefined,
                photos: photoBase64,
                location: formData.city.trim() ? {
                    city: formData.city.trim(),
                    area: formData.area.trim() || undefined
                } : undefined,
                services: servicesFormatted.length > 0 ? servicesFormatted : undefined,
                pricing: formData.hourlyRate ? { hourlyRate: parseFloat(formData.hourlyRate) } : undefined,
                availability: availableDays.length > 0 ? { days: availableDays, hours } : undefined,
            }

            // Register user without VIP payment
            const response = await ButicalAPI.auth.register(registrationData)
            console.log('Registration response:', response)

            const authData = response.data?.data
            const accessToken = authData?.tokens?.accessToken || authData?.accessToken
            const refreshToken = authData?.tokens?.refreshToken || authData?.refreshToken

            if (accessToken) {
                TokenService.setAccessToken(accessToken)
                if (refreshToken) {
                    TokenService.setRefreshToken(refreshToken)
                }
            }

            // Redirect to profile without payment
            router.push('/profile/escort')
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePayment = async () => {
        setPaymentStatus('pending')

        try {
            const phoneNumber = convertPhoneTo254(formData.mpesaPhone || formData.phone)

            // Validate phone format (254XXXXXXXXX)
            if (!/^254\d{9}$/.test(phoneNumber)) {
                throw new Error('Invalid phone format. Use 07XXXXXXXX or 254XXXXXXXXX')
            }

            console.log('Initiating M-Pesa VIP payment for phone:', phoneNumber)

            // Initiate payment - this sends the STK push
            const paymentResponse = await ButicalAPI.payments.subscribeVIP(phoneNumber)
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

                            // API returns 'COMPLETED' not 'SUCCESS'
                            if ((status as string) === 'COMPLETED' || status === 'SUCCESS') {
                                setPaymentStatus('success')
                                setTimeout(() => {
                                    router.push('/profile/escort')
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
                        router.push('/profile/escort')
                    }, 2000)
                }
            }
        } catch (error: any) {
            console.error('Payment error:', error)
            setPaymentStatus('failed')
            setError(error.response?.data?.message || error.message || 'Payment failed. You can upgrade to VIP later from your dashboard.')

            // Still allow user to proceed after payment failure
            setTimeout(() => {
                router.push('/profile/escort')
            }, 3000)
        } finally {
            setIsProcessing(false)
        }
    }

    const nextStep = () => {
        setError(null)

        // Validate current step before proceeding
        if (currentStep === 1) {
            if (!formData.firstName || !formData.lastName || !formData.displayName ||
                !formData.email || !formData.phone || !formData.contactPhone ||
                !formData.password || !formData.gender || !formData.dateOfBirth) {
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
            if (!formData.city || !formData.area || !formData.description || formData.languages.length === 0 || photos.length === 0) {
                setError('Please complete all required fields (city, area, at least 1 language and 1 photo)')
                return
            }
        } else if (currentStep === 3) {
            if (selectedServices.length === 0) {
                setError('Please select at least one service')
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
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Join as an Escort
                    </h1>
                    <p className="text-gray-600">Create your professional profile</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {[1, 2, 3, 4].map((step) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep >= step
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {currentStep > step ? <Check className="w-5 h-5" /> : step}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 hidden md:block">
                                        {step === 1 ? 'Basic' : step === 2 ? 'Profile' : step === 3 ? 'Services' : 'VIP'}
                                    </span>
                                </div>
                                {step < 4 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded ${currentStep > step ? 'bg-purple-500' : 'bg-gray-200'
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name / Stage Name *
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="How clients will see you"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                    placeholder="0712345678"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">For account verification (Format: 07XXXXXXXX)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Phone (For Clients) *
                                </label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0712345678"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Clients will see this number after unlock (Format: 07XXXXXXXX)</p>
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                        <option value="trans-female">Trans Female</option>
                                        <option value="trans-male">Trans Male</option>
                                        <option value="non-binary">Non-binary</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referral Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="referralCode"
                                    value={formData.referralCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter referral code if you have one"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Profile & Location */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile & Location</h2>

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
                                    placeholder="e.g. Nairobi"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Area / Neighborhood *
                                </label>
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Westlands, Kilimani, CBD"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">The specific area where you are based</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    About You *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    placeholder="Describe yourself and what makes you special..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Languages Spoken (Select at least one) *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {languageOptions.map((language) => (
                                        <button
                                            key={language}
                                            type="button"
                                            onClick={() => toggleLanguage(language)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.languages.includes(language)
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {language}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hourly Rate (KSh)
                                </label>
                                <input
                                    type="number"
                                    name="hourlyRate"
                                    value={formData.hourlyRate}
                                    onChange={handleInputChange}
                                    placeholder="5000"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Photos (Up to 4) *
                                </label>
                                <p className="text-sm text-gray-500 mb-4">
                                    Add high-quality photos to attract clients
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                                        </div>
                                    ))}

                                    {photos.length < 4 && (
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500">Upload</span>
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
                        </div>
                    )}

                    {/* Step 3: Services & Availability */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Services & Availability</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Services Offered (Select all that apply) *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {serviceOptions.map((service) => (
                                        <button
                                            key={service}
                                            type="button"
                                            onClick={() => toggleService(service)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${selectedServices.includes(service)
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Availability Schedule (Optional)
                                </label>
                                <div className="space-y-2">
                                    {Object.entries(availability).map(([day, schedule]) => (
                                        <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <label className="flex items-center min-w-[100px]">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.available}
                                                    onChange={() => toggleDayAvailability(day as keyof typeof availability)}
                                                    className="mr-2 w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                    {day}
                                                </span>
                                            </label>

                                            {schedule.available && (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <input
                                                        type="time"
                                                        value={schedule.from}
                                                        onChange={(e) => updateDayTime(day as keyof typeof availability, 'from', e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                    <span className="text-gray-500">to</span>
                                                    <input
                                                        type="time"
                                                        value={schedule.to}
                                                        onChange={(e) => updateDayTime(day as keyof typeof availability, 'to', e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Subscription & Payment */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Registration</h2>
                                <p className="text-gray-600">
                                    Subscribe to Escort VIP and start earning!
                                </p>
                            </div>

                            {/* VIP Subscription Display */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Escort VIP</h3>
                                    <p className="text-sm text-gray-600">1 Year Subscription</p>
                                </div>

                                <div className="text-center mb-6">
                                    <span className="text-4xl font-bold text-purple-600">KSh 3,000</span>
                                    <span className="text-gray-500 text-sm ml-2">/year</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Featured placement on homepage',
                                        'VIP badge on your profile',
                                        'Higher ranking in search results',
                                        'Free contact visibility (no unlock fees)',
                                        'Priority customer support'
                                    ].map((benefit, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-gray-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Payment Section */}
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            M-Pesa Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="mpesaPhone"
                                            value={formData.mpesaPhone || formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="0712345678"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        <span className="text-gray-600">Escort VIP Subscription</span>
                                        <span className="font-medium">KSh 3,000</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                                        <span>Duration</span>
                                        <span>1 Year</span>
                                    </div>
                                    {formData.referralCode && (
                                        <div className="flex justify-between items-center text-sm text-green-600">
                                            <span className="flex items-center gap-1">
                                                <Check className="w-4 h-4" />
                                                Referral Applied
                                            </span>
                                            <span>{formData.referralCode}</span>
                                        </div>
                                    )}
                                    <div className="border-t mt-3 pt-3">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-purple-600">KSh 3,000</span>
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
                                            Please try again or contact support
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Free Account Option */}
                            <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
                                <div className="text-center">
                                    <h4 className="font-medium text-gray-700 mb-2">Not ready to go VIP?</h4>
                                    <p className="text-sm text-gray-500 mb-3">
                                        You can start with a free account. Clients will pay KSh 150 to unlock your contact info.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSkipPayment}
                                        disabled={isProcessing || paymentStatus === 'success' || !formData.ageConfirmed || !formData.termsAccepted}
                                        className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? 'Processing...' : 'Skip & Continue with Free Account'}
                                    </button>
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="space-y-3 pt-4 border-t">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="ageConfirmed"
                                        checked={formData.ageConfirmed}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 mr-3 w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I confirm that I am 18 years or older and all information provided is accurate *
                                    </span>
                                </label>

                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 mr-3 w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-purple-500 hover:text-purple-600">
                                            Terms & Conditions
                                        </Link>
                                        ,{' '}
                                        <Link href="/privacy" className="text-purple-500 hover:text-purple-600">
                                            Privacy Policy
                                        </Link>
                                        , and{' '}
                                        <Link href="/community-guidelines" className="text-purple-500 hover:text-purple-600">
                                            Community Guidelines
                                        </Link>{' '}
                                        *
                                    </span>
                                </label>
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
                                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-colors disabled:opacity-50"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleRegistration}
                                disabled={isProcessing || paymentStatus === 'success'}
                                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Complete & Pay KSh 3,000'
                                )}
                            </button>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-purple-500 hover:text-purple-600 font-medium">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function EscortSignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <EscortSignupPageContent />
        </Suspense>
    )
}
// app/auth/signup/dating/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Upload, X, Eye, EyeOff, Check, Crown, Star, Shield, Zap, Gift, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { toMpesaPhone } from '@/lib/utils/phone'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import { usePublicPricing } from '@/lib/hooks/butical-api-hooks'
import type { DatingUserRegistration } from '@/services/butical-api-service'
import { FieldError, StepErrorSummary } from '@/app/components/forms/FieldError'
import {
    collect, focusFirstError, required, validateAdultDob, validateEmail, validateKenyanPhone,
    validateMinLength, validatePassword, validatePasswordMatch, type FieldErrors,
} from '@/lib/signup/validators'
import { parseSignupError, type FieldMap } from '@/lib/signup/errors'
import { compressImagesToBase64 } from '@/lib/utils/compress-image'

/** Fields on each step, in screen order (used to focus the first problem). */
const STEP_FIELDS: Record<number, string[]> = {
    1: ['firstName', 'lastName', 'displayName', 'email', 'phone', 'password', 'confirmPassword', 'dateOfBirth', 'gender', 'sexualOrientation', 'lookingFor', 'referralCode'],
    2: ['city', 'area', 'country', 'bio', 'interests'],
    3: ['photos', 'ageConfirmed', 'termsAccepted'],
    4: ['mpesaPhone'],
}

const FIELD_LABELS: Record<string, string> = {
    firstName: 'First name', lastName: 'Last name', displayName: 'Display name', email: 'Email', phone: 'Phone',
    password: 'Password', confirmPassword: 'Confirm password', dateOfBirth: 'Date of birth', gender: 'Gender',
    lookingFor: 'Looking for', referralCode: 'Referral code', city: 'City', bio: 'Bio', interests: 'Interests',
    photos: 'Photos', ageConfirmed: 'Age confirmation', termsAccepted: 'Terms', mpesaPhone: 'M-Pesa number',
}

/** API field -> form field and step, for errors the server sends back. */
const DATING_FIELD_MAP: FieldMap = {
    firstName: { field: 'firstName', step: 1 }, lastName: { field: 'lastName', step: 1 },
    displayName: { field: 'displayName', step: 1 }, email: { field: 'email', step: 1 },
    phone: { field: 'phone', step: 1 }, password: { field: 'password', step: 1 },
    dateOfBirth: { field: 'dateOfBirth', step: 1 }, gender: { field: 'gender', step: 1 },
    lookingFor: { field: 'lookingFor', step: 1 }, referralCode: { field: 'referralCode', step: 1 },
    location: { field: 'city', step: 2 }, 'location.city': { field: 'city', step: 2 },
    bio: { field: 'bio', step: 2 }, interests: { field: 'interests', step: 2 },
    photos: { field: 'photos', step: 3 }, ageConfirmed: { field: 'ageConfirmed', step: 3 },
    termsAccepted: { field: 'termsAccepted', step: 3 },
}
/** Payment calls only know about the M-Pesa number. */
const PAYMENT_FIELD_MAP: FieldMap = { phone: { field: 'mpesaPhone', step: 4 } }

const MAX_PHOTO_MB = 20
const MAX_PHOTOS = 6
const MIN_INTERESTS = 3

// Subscription plan - Dating Premium. Price and length are admin-set
// (Platform Settings) and filled in at runtime from /plans/pricing.
const BASE_SUBSCRIPTION_PLAN = {
    id: 'premium',
    name: 'Dating Premium',
    price: 0,
    duration: '',
    features: [
        'Unlimited Likes',
        'See who likes you',
        'Advanced matching',
        'Priority support',
        'Boost profile weekly',
        'Free escort unlocks (5/month)'
    ]
}

/** "365" days reads as "1 Year", "30" as "30 Days". */
function formatDuration(days: number): string {
    if (days > 0 && days % 365 === 0) return days === 365 ? '1 Year' : `${days / 365} Years`
    return `${days} Days`
}

function DatingSignupPageContent() {
    const { pricing, isLoading: pricingLoading } = usePublicPricing()
    const SUBSCRIPTION_PLAN = {
        ...BASE_SUBSCRIPTION_PLAN,
        price: pricing?.datingSubscriptionPrice ?? 0,
        duration: pricing ? formatDuration(pricing.datingSubscriptionDays) : '',
    }
    const priceLabel = pricing
        ? `KSh ${pricing.datingSubscriptionPrice.toLocaleString()}`
        : pricingLoading ? 'KSh …' : 'Price unavailable'
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
        area: '',
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
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

    const interestOptions = [
        'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking',
        'Fitness', 'Photography', 'Dancing', 'Gaming', 'Art', 'Fashion',
        'Nature', 'Technology', 'Food', 'Pets', 'Yoga', 'Hiking'
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        clearFieldError(name)

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const clearFieldError = (...names: string[]) => {
        setFieldErrors(prev => {
            if (!names.some(n => prev[n])) return prev
            const next = { ...prev }
            names.forEach(n => delete next[n])
            return next
        })
    }

    const toggleInterest = (interest: string) => {
        clearFieldError('interests')
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const picked = Array.from(e.target.files)
            const notImages = picked.filter(f => !f.type.startsWith('image/'))
            const tooBig = picked.filter(f => f.type.startsWith('image/') && f.size > MAX_PHOTO_MB * 1024 * 1024)
            const usable = picked.filter(f => f.type.startsWith('image/') && f.size <= MAX_PHOTO_MB * 1024 * 1024)
            const newPhotos = usable.slice(0, MAX_PHOTOS - photos.length)
            setPhotos(prev => [...prev, ...newPhotos])
            const problems = [
                notImages.length ? `${notImages.map(f => f.name).join(', ')} ${notImages.length === 1 ? 'is not a photo' : 'are not photos'}. Use JPG or PNG.` : '',
                tooBig.length ? `${tooBig.map(f => f.name).join(', ')} ${tooBig.length === 1 ? 'is' : 'are'} over ${MAX_PHOTO_MB}MB.` : '',
                usable.length > newPhotos.length ? `Only ${MAX_PHOTOS} photos are allowed, so ${usable.length - newPhotos.length} ${usable.length - newPhotos.length === 1 ? 'was' : 'were'} not added.` : '',
            ].filter(Boolean).join(' ')
            if (problems) setFieldErrors(prev => ({ ...prev, photos: problems }))
            else if (newPhotos.length) clearFieldError('photos')
            e.target.value = '' // allow picking the same file again after removing it
        }
    }

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
    }

    // Accepts +254 / 07 / spaces (browser autofill adds "+254")
    const convertPhoneTo254 = toMpesaPhone

    /** Problems on one step. `paying` adds the M-Pesa check. */
    const validateStep = (step: number, opts: { paying?: boolean } = {}): FieldErrors => {
        if (step === 1) {
            return collect({
                firstName: required(formData.firstName, 'First name'),
                lastName: required(formData.lastName, 'Last name'),
                email: validateEmail(formData.email),
                phone: validateKenyanPhone(formData.phone),
                password: validatePassword(formData.password),
                confirmPassword: validatePasswordMatch(formData.password, formData.confirmPassword),
                dateOfBirth: validateAdultDob(formData.dateOfBirth),
                gender: required(formData.gender, 'Gender'),
                lookingFor: formData.lookingFor ? null : 'Choose what you are looking for',
                referralCode: formData.referralCode.trim() && !/^[A-Za-z0-9]{4,16}$/.test(formData.referralCode.trim())
                    ? 'Referral codes are letters and numbers only. Check it, or leave it blank.' : null,
            })
        }
        if (step === 2) {
            return collect({
                city: required(formData.city, 'City'),
                bio: validateMinLength(formData.bio, 20, 'Bio'),
                interests: formData.interests.length >= MIN_INTERESTS
                    ? null
                    : `Choose at least ${MIN_INTERESTS} interests (${formData.interests.length} chosen)`,
            })
        }
        if (step === 3) {
            return collect({
                photos: fieldErrors.photos && photos.length === 0 ? fieldErrors.photos
                    : photos.length ? null : 'Add at least one photo',
                ageConfirmed: formData.ageConfirmed ? null : 'Confirm you are 18 or older',
                termsAccepted: formData.termsAccepted ? null : 'Accept the terms to continue',
            })
        }
        return collect({
            mpesaPhone: opts.paying ? validateKenyanPhone(mpesaPhone || formData.phone, 'M-Pesa number') : null,
        })
    }

    /** Shows problems on a step, moving there and to the first bad field. */
    const showProblems = (errors: FieldErrors, step: number, message?: string) => {
        const count = Object.keys(errors).length
        setFieldErrors(errors)
        setError(message ?? (count > 1 ? `Please fix ${count} things on this step.` : Object.values(errors)[0]))
        if (step !== currentStep) setCurrentStep(step)
        focusFirstError(errors, STEP_FIELDS[step] ?? [])
    }

    /** Checks every step before sending; returns true when something needs fixing. */
    const validateAll = (opts: { paying?: boolean } = {}): boolean => {
        for (const step of [1, 2, 3, 4]) {
            const errors = validateStep(step, opts)
            if (Object.keys(errors).length) {
                showProblems(errors, step, step < currentStep
                    ? `Something on step ${step} needs fixing before you can finish.`
                    : undefined)
                return true
            }
        }
        return false
    }

    /** Turns a failed request into messages on the right step and field. */
    const showServerProblem = (err: any, fallback: string, map: FieldMap = DATING_FIELD_MAP) => {
        const problem = parseSignupError(err, map, fallback)
        setFieldErrors(problem.fieldErrors)
        setError(problem.message)
        if (problem.step && problem.step !== currentStep) setCurrentStep(problem.step)
        if (Object.keys(problem.fieldErrors).length && problem.step) {
            focusFirstError(problem.fieldErrors, STEP_FIELDS[problem.step] ?? [])
        } else {
            setTimeout(() => document.getElementById('signup-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
        }
    }

    const handleRegistration = async () => {
        setError(null)
        setIsProcessing(true)

        try {
            // Check every step (and the M-Pesa number) before creating the account
            if (validateAll({ paying: true })) {
                setIsProcessing(false)
                return
            }

            // Shrink photos first: full-size phone photos made signups fail
            const photoBase64 = await compressImagesToBase64(photos)

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
                    area: formData.area.trim() || undefined,
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
            showServerProblem(err, 'Registration failed. Please try again.')
            setIsProcessing(false)
        }
    }

    const handlePayment = async () => {
        setPaymentStatus('pending')

        try {
            const phoneNumber = convertPhoneTo254(mpesaPhone || formData.phone)

            // Validate phone format (254XXXXXXXXX)
            if (!/^254\d{9}$/.test(phoneNumber)) {
                throw new Error('Invalid phone number. Use 07XXXXXXXX or +254XXXXXXXXX')
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

            showServerProblem(error, 'Payment failed. Check the number and try again.', PAYMENT_FIELD_MAP)

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
        // Check this step before moving on
        const errors = validateStep(currentStep)
        if (Object.keys(errors).length) {
            showProblems(errors, currentStep)
            return
        }
        setError(null)
        setFieldErrors({})
        setCurrentStep(prev => Math.min(prev + 1, 4))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const prevStep = () => {
        setError(null)
        setFieldErrors({})
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const stepLabels = ['Basic Info', 'Profile', 'Photos', 'Payment']

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                        <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                            <Heart className="w-6 h-6 text-white fill-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">LoveBite</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Join Our Dating Community</h1>
                    <p className="text-gray-500">Find your perfect match today</p>
                </motion.div>

                {/* Step Progress */}
                <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="flex items-center">
                        {[1, 2, 3, 4].map((step, index) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${currentStep > step
                                            ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
                                            : currentStep === step
                                                ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 ring-4 ring-pink-200'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                        animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {currentStep > step ? <Check className="w-4 h-4" /> : step}
                                    </motion.div>
                                    <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${currentStep >= step ? 'text-pink-600' : 'text-gray-400'}`}>
                                        {stepLabels[index]}
                                    </span>
                                </div>
                                {index < 3 && (
                                    <div className="flex-1 mx-2 mb-4">
                                        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                                                initial={{ width: '0%' }}
                                                animate={{ width: currentStep > step ? '100%' : '0%' }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-6 md:p-8 border border-gray-100"
                    layout
                >
                    <div id="signup-errors">
                        <StepErrorSummary
                            message={error}
                            errors={fieldErrors}
                            labels={FIELD_LABELS}
                            onDismiss={() => setError(null)}
                        />
                    </div>

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
                                        name="firstName" aria-invalid={!!fieldErrors.firstName}
                                        autoComplete="given-name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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
                                        autoComplete="family-name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                    />
                                    <FieldError message={fieldErrors.lastName} />
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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
                                    name="email" aria-invalid={!!fieldErrors.email}
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0712345678"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                />
                                <FieldError message={fieldErrors.phone} />
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
                                        name="password" aria-invalid={!!fieldErrors.password}
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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
                                <FieldError message={fieldErrors.confirmPassword} />
                            </div>

                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    id="dateOfBirth"
                                    type="date"
                                    name="dateOfBirth" aria-invalid={!!fieldErrors.dateOfBirth}
                                    autoComplete="bday"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                />
                                <FieldError message={fieldErrors.dateOfBirth} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender" aria-invalid={!!fieldErrors.gender}
                                        autoComplete="sex"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <FieldError message={fieldErrors.gender} />
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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
                                    name="lookingFor" aria-invalid={!!fieldErrors.lookingFor}
                                    value={formData.lookingFor}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                >
                                    <option value="">What are you looking for?</option>
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                    <option value="everyone">Everyone</option>
                                </select>
                                <FieldError message={fieldErrors.lookingFor} />
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
                                    name="referralCode" aria-invalid={!!fieldErrors.referralCode}
                                    autoComplete="off"
                                    value={formData.referralCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter referral code if you have one"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                />
                                <FieldError message={fieldErrors.referralCode} />
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
                                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        City *
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        name="city" aria-invalid={!!fieldErrors.city}
                                        autoComplete="address-level2"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nairobi"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                    />
                                    <FieldError message={fieldErrors.city} />
                                </div>

                                <div>
                                    <label htmlFor="area" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Area / Neighborhood
                                    </label>
                                    <input
                                        id="area"
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Kilimani, Westlands"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Country *
                                </label>
                                <input
                                    id="country"
                                    type="text"
                                    name="country"
                                    autoComplete="country-name"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                    About Me *
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio" aria-invalid={!!fieldErrors.bio}
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                                />
                                <FieldError message={fieldErrors.bio} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interests (Select at least 3) *
                                </label>
                                <div id="field-interests" tabIndex={-1} className="flex flex-wrap gap-2">
                                    {interestOptions.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${formData.interests.includes(interest)
                                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md shadow-pink-500/20'
                                                    : 'border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50'
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                                <FieldError message={fieldErrors.interests} />
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
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

                                <div id="field-photos" tabIndex={-1} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-400 hover:bg-pink-50 cursor-pointer flex flex-col items-center justify-center transition-all group">
                                            <div className="w-10 h-10 bg-pink-100 group-hover:bg-pink-200 rounded-xl flex items-center justify-center mb-2 transition-colors">
                                                <Upload className="w-5 h-5 text-pink-500" />
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">Upload Photo</span>
                                            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <FieldError message={fieldErrors.photos} />
                            </div>

                            <div className="space-y-3 pt-4">
                                <label htmlFor="ageConfirmed" className="flex items-start cursor-pointer">
                                    <input
                                        id="ageConfirmed"
                                        type="checkbox"
                                        name="ageConfirmed" aria-invalid={!!fieldErrors.ageConfirmed}
                                        checked={formData.ageConfirmed}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 mr-3 w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I confirm that I am 18 years or older *
                                    </span>
                                </label>
                                <FieldError message={fieldErrors.ageConfirmed} />

                                <label htmlFor="termsAccepted" className="flex items-start cursor-pointer">
                                    <input
                                        id="termsAccepted"
                                        type="checkbox"
                                        name="termsAccepted" aria-invalid={!!fieldErrors.termsAccepted}
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
                                <FieldError message={fieldErrors.termsAccepted} />
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
                                        {priceLabel}
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
                                            name="mpesaPhone" aria-invalid={!!fieldErrors.mpesaPhone}
                                            autoComplete="tel"
                                            value={mpesaPhone || formData.phone}
                                            onChange={(e) => { setMpesaPhone(e.target.value); clearFieldError('mpesaPhone') }}
                                            placeholder="0712345678"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                        <FieldError message={fieldErrors.mpesaPhone} />
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
                                            {priceLabel}
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
                                                {priceLabel}
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

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {currentStep > 1 ? (
                            <motion.button type="button" onClick={prevStep} disabled={isProcessing}
                                className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </motion.button>
                        ) : (
                            <Link href="/">
                                <button type="button" className="px-5 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
                                    Cancel
                                </button>
                            </Link>
                        )}

                        {currentStep < 4 ? (
                            <motion.button type="button" onClick={nextStep} disabled={isProcessing}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        ) : (
                            <motion.button type="button" onClick={handleRegistration} disabled={isProcessing || !pricing || paymentStatus === 'success'}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={!isProcessing ? { scale: 1.02 } : {}} whileTap={!isProcessing ? { scale: 0.98 } : {}}
                            >
                                {isProcessing ? (
                                    <>
                                        <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                                        Processing...
                                    </>
                                ) : `Complete & Pay ${priceLabel}`}
                            </motion.button>
                        )}
                    </div>

                    <p className="mt-5 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-pink-500 hover:text-pink-600 font-semibold transition-colors">Log in</Link>
                    </p>
                </motion.div>
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
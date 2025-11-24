// app/profile/escort/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Edit2, Save, X, Upload, MapPin, Phone, Clock,
    Star, Eye, Crown, Languages,
    Gift, TrendingUp, ChevronRight, AlertCircle, Zap, Sparkles,
    CreditCard, RefreshCw, Loader2
} from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { User, Escort, Subscription, WalletSummary, ReferralCode } from '@/services/butical-api-service'

// Subscription plan details
const SUBSCRIPTION_PLANS = {
    BASIC: { name: 'Starter', price: 0, color: 'gray', icon: Star },
    PREMIUM: { name: 'Professional', price: 3000, color: 'purple', icon: Zap },
    VIP: { name: 'VIP Elite', price: 3000, color: 'yellow', icon: Crown }
}

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

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

// Helper to get service name from EscortService (can be string or object)
const getServiceName = (service: string | { name: string }): string => {
    return typeof service === 'string' ? service : service.name
}

// Helper to check if a service is in the list
const hasService = (services: (string | { name: string })[] | undefined, serviceName: string): boolean => {
    if (!services) return false
    return services.some(s => getServiceName(s) === serviceName)
}

export default function EscortPage() {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // User data
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Escort | null>(null)
    const [editedProfile, setEditedProfile] = useState<Partial<Escort>>({})
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [wallet, setWallet] = useState<WalletSummary | null>(null)
    const [referralCode, setReferralCode] = useState<ReferralCode | null>(null)

    // Photo handling
    const [newPhotos, setNewPhotos] = useState<File[]>([])
    const [photosToDelete, setPhotosToDelete] = useState<string[]>([])

    // Stats (TODO: Get from API when available)
    const [stats] = useState({
        views: 0,
        unlocks: 0,
        rating: 0,
        reviews: 0
    })

    // Note: Escort earnings are managed externally, not through this platform

    // Fetch all data on mount
    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Check if user is logged in
            const token = TokenService.getAccessToken()
            if (!token) {
                router.push('/auth/login')
                return
            }

            // Fetch all data in parallel
            const [userResponse, subscriptionResponse] = await Promise.all([
                ButicalAPI.users.getMe(),
                ButicalAPI.users.getSubscription().catch(() => null),
            ])

            // API wraps responses in { status, data: T } - unwrap if needed
            const unwrap = <T,>(response: any): T => {
                if (response?.data !== undefined && response?.status !== undefined) {
                    return response.data as T
                }
                return response as T
            }

            const userData = unwrap<any>(userResponse.data)
            console.log('User data fetched:', userData)
            setUser(userData)

            // The escort profile is nested inside user data as 'escort'
            const escortData = userData?.escort
            console.log('Escort data from user:', escortData)

            if (escortData) {
                // Add display properties from user data
                const enrichedEscort = {
                    ...escortData,
                    displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
                    user: {
                        id: userData.id,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        phone: userData.phone
                    }
                }
                setProfile(enrichedEscort)
                setEditedProfile(enrichedEscort)
            }
            setSubscription(subscriptionResponse ? unwrap(subscriptionResponse.data) : null)

            // Fetch referral and wallet data
            try {
                const [walletResponse, referralResponse] = await Promise.all([
                    ButicalAPI.wallet.getSummary(),
                    ButicalAPI.referrals.getMyCode()
                ])
                setWallet(unwrap(walletResponse.data))
                setReferralCode(unwrap(referralResponse.data))
            } catch (err) {
                // Referral/wallet might not be available for all users
                console.log('Referral/wallet data not available')
            }
        } catch (err: any) {
            console.error('Failed to fetch profile data:', err)
            setError(err.response?.data?.message || 'Failed to load profile. Please try again.')

            // If unauthorized, redirect to login
            if (err.response?.status === 401) {
                TokenService.clearTokens()
                router.push('/auth/login')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setEditedProfile(prev => ({ ...prev, [name]: value }))
    }

    const toggleService = (service: string) => {
        setEditedProfile(prev => ({
            ...prev,
            services: hasService(prev.services, service)
                ? prev.services?.filter(s => getServiceName(s) !== service)
                : [...(prev.services || []), service]
        }))
    }

    const toggleLanguage = (language: string) => {
        setEditedProfile(prev => ({
            ...prev,
            languages: prev.languages?.includes(language)
                ? prev.languages.filter(l => l !== language)
                : [...(prev.languages || []), language]
        }))
    }

    const toggleDayAvailability = (day: string) => {
        setEditedProfile(prev => {
            const currentDay = prev.availability?.[day] || { available: false, from: '09:00', to: '22:00' }
            return {
                ...prev,
                availability: {
                    ...prev.availability,
                    [day]: {
                        available: !currentDay.available,
                        from: currentDay.from,
                        to: currentDay.to
                    }
                }
            }
        })
    }

    const updateDayTime = (day: string, field: 'from' | 'to', value: string) => {
        setEditedProfile(prev => {
            const currentDay = prev.availability?.[day] || { available: false, from: '09:00', to: '22:00' }
            return {
                ...prev,
                availability: {
                    ...prev.availability,
                    [day]: {
                        available: currentDay.available,
                        from: field === 'from' ? value : currentDay.from,
                        to: field === 'to' ? value : currentDay.to
                    }
                }
            }
        })
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const currentPhotoCount = (editedProfile.photos?.length || 0) + newPhotos.length
            const availableSlots = 4 - currentPhotoCount
            setNewPhotos(prev => [...prev, ...files].slice(0, availableSlots))
        }
    }

    const removeExistingPhoto = (photoUrl: string) => {
        setEditedProfile(prev => ({
            ...prev,
            photos: prev.photos?.filter(p => p !== photoUrl)
        }))
        setPhotosToDelete(prev => [...prev, photoUrl])
    }

    const removeNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index))
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

    const handleSave = async () => {
        try {
            setIsSaving(true)
            setError(null)

            // Convert new photos to base64 if any
            let newPhotoBase64: string[] = []
            if (newPhotos.length > 0) {
                newPhotoBase64 = await convertFilesToBase64(newPhotos)
            }

            // Prepare update data with proper structure
            const updateData: any = {
                displayName: editedProfile.displayName,
                about: editedProfile.about,
                services: editedProfile.services,
                languages: editedProfile.languages,
                contactPhone: editedProfile.contactPhone,
                availability: editedProfile.availability,
            }

            // Add pricing if hourlyRate is set
            if (editedProfile.hourlyRate !== undefined) {
                updateData.pricing = {
                    ...editedProfile.pricing,
                    hourlyRate: editedProfile.hourlyRate
                }
            }

            // Add locations if location data exists
            if (editedProfile.location || editedProfile.locations) {
                if (typeof editedProfile.location === 'string') {
                    // If location is a string, parse it or use as city
                    updateData.locations = {
                        city: editedProfile.location,
                        area: editedProfile.locations?.area,
                        country: editedProfile.locations?.country
                    }
                } else {
                    // If locations is already an object, use it
                    updateData.locations = editedProfile.locations
                }
            }

            // Add photos (combine existing photos not deleted with new photos)
            updateData.photos = [
                ...(editedProfile.photos || []),
                ...newPhotoBase64
            ]

            console.log('Sending escort profile update:', updateData)
            console.log('Photo count:', updateData.photos.length)

            // Update profile via API
            const response = await ButicalAPI.escorts.updateMe(updateData)
            console.log('Escort update response:', response)

            // Unwrap response if needed (API may wrap in { status, data })
            const responseData = response.data as any
            const updatedProfile = responseData?.data || responseData
            setProfile(updatedProfile)
            setEditedProfile(updatedProfile)
            setNewPhotos([])
            setPhotosToDelete([])
            setIsEditing(false)

            // Show success message
            alert('Profile updated successfully!')
        } catch (err: any) {
            console.error('Failed to save profile:', err)
            setError(err.response?.data?.message || 'Failed to save profile. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditedProfile(profile || {})
        setNewPhotos([])
        setPhotosToDelete([])
        setError(null)
        setIsEditing(false)
    }

    // Subscription helpers
    const getDaysRemaining = () => {
        if (!subscription?.endDate) return 0
        const expiry = new Date(subscription.endDate)
        const now = new Date()
        const diff = expiry.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const isExpiringSoon = () => {
        return getDaysRemaining() <= 7 && getDaysRemaining() > 0
    }

    const isExpired = () => {
        return getDaysRemaining() <= 0 || subscription?.status === 'EXPIRED'
    }

    const hasSubscription = () => {
        return subscription !== null && subscription.type !== 'BASIC'
    }

    const getCurrentPlan = () => {
        if (!subscription?.type) return SUBSCRIPTION_PLANS.BASIC
        return SUBSCRIPTION_PLANS[subscription.type as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.BASIC
    }

    const isVIP = () => {
        return subscription?.type === 'VIP' && subscription?.status === 'ACTIVE' && !isExpired()
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error && !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No profile found</p>
                </div>
            </div>
        )
    }

    // Age not available in Escort type
    const age = 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/escorts"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </Link>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Save</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm flex-1">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Subscription Status Banner */}
                {hasSubscription() && subscription && subscription.status === 'ACTIVE' && !isExpired() && !isExpiringSoon() && (
                    <div className={`rounded-xl p-4 mb-6 ${subscription.type === 'VIP'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : subscription.type === 'PREMIUM'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                                : 'bg-gradient-to-r from-gray-700 to-gray-800'
                        } text-white`}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                {subscription.type === 'VIP' && <Crown className="w-8 h-8" />}
                                {subscription.type === 'PREMIUM' && <Zap className="w-8 h-8" />}
                                {subscription.type === 'BASIC' && <Star className="w-8 h-8" />}
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {getCurrentPlan()?.name} Plan
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        {getDaysRemaining()} days remaining • Expires {new Date(subscription.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.autoRenew ? 'bg-white/20' : 'bg-white/10'
                                    }`}>
                                    {subscription.autoRenew ? '✓ Auto-renew' : 'Auto-renew OFF'}
                                </span>
                                <Link
                                    href="/subscription/escort"
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {subscription.type === 'VIP' ? 'Manage' : 'Upgrade'}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expiring Soon Warning */}
                {hasSubscription() && isExpiringSoon() && subscription && (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">Subscription Expiring Soon!</h3>
                                <p className="text-sm text-yellow-100">
                                    Your {getCurrentPlan()?.name} plan expires in {getDaysRemaining()} days. Renew now to maintain your visibility!
                                </p>
                            </div>
                            <Link
                                href="/subscription/escort"
                                className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
                            >
                                Renew Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Expired Notice */}
                {hasSubscription() && isExpired() && subscription && (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">Subscription Expired</h3>
                                <p className="text-sm text-red-100">
                                    Your profile visibility has been reduced. Renew to get more clients!
                                </p>
                            </div>
                            <Link
                                href="/subscription/escort"
                                className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
                            >
                                Reactivate
                            </Link>
                        </div>
                    </div>
                )}

                {/* No Subscription - Promote */}
                {!hasSubscription() && (
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-xl mb-1">Boost Your Visibility!</h3>
                                <p className="text-purple-100">
                                    Subscribe to get more views, more clients, and earn more money. VIP members earn 3x more!
                                </p>
                            </div>
                            <Link
                                href="/subscription/escort"
                                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors whitespace-nowrap"
                            >
                                Subscribe Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Referral Earnings Banner */}
                {wallet && (wallet.currentBalance || wallet.balance || 0) > 0 && (
                    <Link
                        href="/referral"
                        className="block bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-4 mb-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <Gift className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Referral Earnings</h3>
                                    <p className="text-2xl font-bold">
                                        KSh {(wallet.currentBalance || wallet.balance || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-100">
                                        {referralCode?.referralCount || 0} referrals • Available to withdraw
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </div>
                    </Link>
                )}

                {/* Note: Escort earnings from bookings are managed outside this platform */}

                {/* Profile Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
                        <p className="text-sm text-gray-600">Views</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Phone className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{stats.unlocks}</p>
                        <p className="text-sm text-gray-600">Unlocks</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Star className="w-6 h-6 text-purple-500 mx-auto mb-2 fill-current" />
                        <p className="text-2xl font-bold text-gray-900">{stats.rating || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Rating</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <div className="w-6 h-6 text-purple-500 mx-auto mb-2 flex items-center justify-center text-xl">
                            💬
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.reviews}</p>
                        <p className="text-sm text-gray-600">Reviews</p>
                    </div>
                </div>

                {/* Subscription Details Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Subscription</h2>
                        <Link
                            href="/subscription/escort"
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                        >
                            Manage
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {hasSubscription() && subscription ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${subscription.type === 'VIP' ? 'bg-yellow-100' :
                                        subscription.type === 'PREMIUM' ? 'bg-purple-100' : 'bg-gray-100'
                                    }`}>
                                    {subscription.type === 'VIP' && <Crown className="w-6 h-6 text-yellow-600" />}
                                    {subscription.type === 'PREMIUM' && <Zap className="w-6 h-6 text-purple-600" />}
                                    {subscription.type === 'BASIC' && <Star className="w-6 h-6 text-gray-600" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{getCurrentPlan()?.name} Plan</h3>
                                    <p className="text-sm text-gray-600">
                                        KSh {getCurrentPlan()?.price.toLocaleString()}/year
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.status === 'EXPIRED' || isExpired()
                                        ? 'bg-red-100 text-red-700'
                                        : isExpiringSoon()
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                    {subscription.status === 'EXPIRED' || isExpired() ? 'Expired' :
                                        isExpiringSoon() ? 'Expiring Soon' : 'Active'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Started</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(subscription.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Expires</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(subscription.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Auto-renew</p>
                                    <p className={`font-medium ${subscription.autoRenew ? 'text-green-600' : 'text-gray-900'}`}>
                                        {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Days Remaining</p>
                                    <p className={`font-medium ${isExpiringSoon() ? 'text-yellow-600' :
                                            isExpired() ? 'text-red-600' : 'text-gray-900'
                                        }`}>
                                        {getDaysRemaining() > 0 ? getDaysRemaining() : 0} days
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {subscription.type !== 'VIP' && (
                                    <Link
                                        href="/subscription/escort"
                                        className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-medium text-center hover:bg-purple-600 transition-colors"
                                    >
                                        Upgrade Plan
                                    </Link>
                                )}
                                <Link
                                    href="/subscription/escort"
                                    className={`py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${subscription.type === 'VIP' ? 'flex-1' : ''
                                        }`}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Renew
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Subscribe to boost your visibility and get more clients
                            </p>
                            <Link
                                href="/subscription/escort"
                                className="inline-block px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                            >
                                View Plans
                            </Link>
                        </div>
                    )}
                </div>

                {/* Profile Content */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Photos Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>

                        {!isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {profile.photos && profile.photos.length > 0 ? (
                                    profile.photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                            <img
                                                src={photo}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-4 text-center py-8 text-gray-500">
                                        No photos uploaded yet
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Existing photos */}
                                    {editedProfile.photos?.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={photo}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingPhoto(photo)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* New photos */}
                                    {newPhotos.map((photo, index) => (
                                        <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={URL.createObjectURL(photo)}
                                                alt={`New ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewPhoto(index)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                New
                                            </div>
                                        </div>
                                    ))}

                                    {/* Upload button */}
                                    {((editedProfile.photos?.length || 0) + newPhotos.length) < 4 && (
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Add Photo</span>
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
                                <p className="text-sm text-gray-500">
                                    Add up to 4 high-quality photos. First photo is your main display.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                            <div className="flex items-center gap-2">
                                {isVIP() && (
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Crown className="w-5 h-5" />
                                        <span className="text-sm font-medium">VIP</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {profile.displayName}, {age}
                                    </h3>
                                    <div className="flex items-center text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>{profile.location}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Location</p>
                                        <p className="text-gray-900 font-medium capitalize">{profile.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                                        <p className="text-gray-900 font-medium">
                                            KSh {profile.hourlyRate ? parseInt(profile.hourlyRate.toString()).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Contact Phone</p>
                                        <p className="text-gray-900 font-medium">{profile.contactPhone || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900 font-medium">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Name / Stage Name
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={editedProfile.displayName || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hourly Rate (KSh)
                                        </label>
                                        <input
                                            type="number"
                                            name="hourlyRate"
                                            value={editedProfile.hourlyRate || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City / Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={editedProfile.location || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Phone (For Clients)
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={editedProfile.contactPhone || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This number will be shown to clients after unlock
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* About/Description */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>

                        {!isEditing ? (
                            <p className="text-gray-700 leading-relaxed">{profile.about || 'No description added yet.'}</p>
                        ) : (
                            <textarea
                                name="about"
                                value={editedProfile.about || ''}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Describe your services and what makes you special..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                        )}
                    </div>

                    {/* Services */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>

                        {!isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {profile.services && profile.services.length > 0 ? (
                                    profile.services.map((service, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                                        >
                                            {getServiceName(service)}
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-3 text-gray-500">No services listed</p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {serviceOptions.map((service) => (
                                    <button
                                        key={service}
                                        type="button"
                                        onClick={() => toggleService(service)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${hasService(editedProfile.services, service)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {service}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Languages */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Languages</h2>

                        {!isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.languages && profile.languages.length > 0 ? (
                                    profile.languages.map((language) => (
                                        <div
                                            key={language}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                        >
                                            <Languages className="w-4 h-4" />
                                            {language}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No languages listed</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {languageOptions.map((language) => (
                                    <button
                                        key={language}
                                        type="button"
                                        onClick={() => toggleLanguage(language)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${editedProfile.languages?.includes(language)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {language}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Availability Schedule */}
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Availability Schedule</h2>

                        {!isEditing ? (
                            <div className="space-y-2">
                                {profile.availability && Object.keys(profile.availability).length > 0 ? (
                                    daysOfWeek.map((day) => {
                                        const schedule = profile.availability?.[day]
                                        return (
                                            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-900 capitalize min-w-[100px]">
                                                    {day}
                                                </span>
                                                {schedule?.available ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Clock className="w-4 h-4 text-purple-500" />
                                                        <span>{schedule.from} - {schedule.to}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Not available</span>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No availability set</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {daysOfWeek.map((day) => {
                                    const schedule = editedProfile.availability?.[day] || { available: false, from: '09:00', to: '17:00' }
                                    return (
                                        <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <label className="flex items-center min-w-[100px]">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.available}
                                                    onChange={() => toggleDayAvailability(day)}
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
                                                        onChange={(e) => updateDayTime(day, 'from', e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                    <span className="text-gray-500">to</span>
                                                    <input
                                                        type="time"
                                                        value={schedule.to}
                                                        onChange={(e) => updateDayTime(day, 'to', e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Link
                        href="/subscription/escort"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Subscription</h3>
                                <p className="text-sm text-gray-600">
                                    {hasSubscription() ? `${getCurrentPlan()?.name} Plan` : 'No active plan'}
                                </p>
                            </div>
                            <Crown className="w-8 h-8 text-purple-500" />
                        </div>
                    </Link>

                    <Link
                        href="/referral"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Referral Earnings</h3>
                                <p className="text-sm text-gray-600">Earn from referrals</p>
                                {wallet && (wallet.currentBalance || wallet.balance || 0) > 0 && (
                                    <p className="text-sm text-green-600 font-semibold mt-1">
                                        KSh {(wallet.currentBalance || wallet.balance || 0).toLocaleString()} earned
                                    </p>
                                )}
                            </div>
                            <Gift className="w-8 h-8 text-purple-500" />
                        </div>
                    </Link>
                </div>

                {/* Delete Account */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. All your data and earnings history will be permanently removed.
                    </p>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                // TODO: Implement account deletion
                                alert('Account deletion not yet implemented')
                            }
                        }}
                        className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                    >
                        Delete Account
                    </button>
                </div>
            </main>
        </div>
    )
}
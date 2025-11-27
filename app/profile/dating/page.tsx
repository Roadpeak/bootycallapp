// app/profile/dating/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Edit2, Save, X, Upload, MapPin, Briefcase,
    GraduationCap, Check, Gift,
    Crown, Star, Zap, AlertCircle, ChevronRight, RefreshCw,
    CreditCard, Sparkles, Loader2
} from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { User, DatingProfile, Subscription, WalletSummary, ReferralCode } from '@/services/butical-api-service'
import { getImageUrl } from '@/lib/utils/image'

// Subscription plan details
const SUBSCRIPTION_PLANS = {
    BASIC: { name: 'Basic', price: 0, color: 'gray', icon: Star },
    PREMIUM: { name: 'Premium', price: 300, color: 'pink', icon: Zap },
    VIP: { name: 'VIP', price: 3000, color: 'purple', icon: Crown }
}

const interestOptions = [
    'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking',
    'Fitness', 'Photography', 'Dancing', 'Gaming', 'Art', 'Fashion',
    'Nature', 'Technology', 'Food', 'Pets', 'Yoga', 'Hiking', 'Coffee'
]

export default function DatingProfilePage() {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // User data
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<DatingProfile | null>(null)
    const [editedProfile, setEditedProfile] = useState<Partial<DatingProfile>>({})
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [wallet, setWallet] = useState<WalletSummary | null>(null)
    const [referralCode, setReferralCode] = useState<ReferralCode | null>(null)

    // Photo handling
    const [newPhotos, setNewPhotos] = useState<File[]>([])
    const [photosToDelete, setPhotosToDelete] = useState<string[]>([])

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
            // if (!token) {
            //     router.push('/auth/login')
            //     return
            // }

            // Fetch all data in parallel
            const [userResponse, profileResponse, subscriptionResponse] = await Promise.all([
                ButicalAPI.users.getMe(),
                ButicalAPI.datingProfiles.getMe(),
                ButicalAPI.users.getSubscription().catch(() => null),
            ])

            // API wraps responses in { status, data: T } - unwrap if needed
            const unwrap = <T,>(response: any): T => {
                if (response?.data !== undefined && response?.status !== undefined) {
                    return response.data as T
                }
                return response as T
            }

            setUser(unwrap(userResponse.data))
            setProfile(unwrap(profileResponse.data))
            setEditedProfile(unwrap(profileResponse.data))
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

    const toggleInterest = (interest: string) => {
        setEditedProfile(prev => ({
            ...prev,
            interests: prev.interests?.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...(prev.interests || []), interest]
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const currentPhotoCount = (editedProfile.photos?.length || 0) + newPhotos.length
            const availableSlots = 6 - currentPhotoCount
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

            // Prepare update data (only send fields that the API accepts)
            const updateData: any = {
                bio: editedProfile.bio,
                interests: editedProfile.interests,
                location: editedProfile.location,
                lookingFor: editedProfile.lookingFor,
                education: editedProfile.education,
                occupation: editedProfile.occupation,
                // Combine existing photos (not deleted) with new photos
                photos: [
                    ...(editedProfile.photos || []),
                    ...newPhotoBase64
                ]
            }

            console.log('Sending dating profile update:', updateData)
            console.log('Photo count:', updateData.photos.length)

            // Update profile via API
            const response = await ButicalAPI.datingProfiles.updateMe(updateData)
            console.log('Dating profile update response:', response)

            // Unwrap response if needed (API may wrap in { status, data })
            const responseData = response.data as any
            const updatedProfile = responseData?.data || responseData
            setProfile(updatedProfile)
            setEditedProfile(updatedProfile)
            setNewPhotos([])
            setPhotosToDelete([])
            setIsEditing(false)

            // Show success message (optional)
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
        if (!subscription?.expiresAt && !subscription?.endDate) return 0
        const expiry = new Date(subscription.expiresAt || subscription.endDate || '')
        const now = new Date()
        const diff = expiry.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const isExpiringSoon = () => {
        return getDaysRemaining() <= 7 && getDaysRemaining() > 0
    }

    const isExpired = () => {
        return getDaysRemaining() <= 0
    }

    const getCurrentPlan = () => {
        if (!subscription?.type) return SUBSCRIPTION_PLANS.BASIC
        return SUBSCRIPTION_PLANS[subscription.type as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.BASIC
    }

    const isVIP = () => {
        return subscription?.type === 'VIP' && (subscription?.status === 'ACTIVE' || subscription?.isSubscribed) && !isExpired()
    }

    const isPremium = () => {
        return (subscription?.type === 'PREMIUM' || subscription?.type === 'VIP') &&
            (subscription?.status === 'ACTIVE' || subscription?.isSubscribed) && !isExpired()
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
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
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // Helper to get display name from dating profile
    const getDisplayName = (p: DatingProfile): string => {
        if (p.name) return p.name
        if (p.user) {
            return p.user.displayName || p.user.firstName || 'Anonymous'
        }
        return 'Anonymous'
    }

    // Helper to calculate age from dateOfBirth
    const calculateAge = (dateOfBirth: string | undefined): number => {
        if (!dateOfBirth) return 0
        const today = new Date()
        const birthDate = new Date(dateOfBirth)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    // Helper to get location string
    const getLocationString = (p: DatingProfile): string => {
        if (typeof p.location === 'string') return p.location
        if (p.location && typeof p.location === 'object') {
            const loc = p.location as { city?: string; area?: string; country?: string }
            const parts = [loc.area, loc.city, loc.country].filter(Boolean)
            return parts.join(', ') || 'Unknown location'
        }
        return 'Unknown location'
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

    const displayName = getDisplayName(profile)
    const age = profile?.age || calculateAge(profile?.dateOfBirth)
    const locationStr = getLocationString(profile)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dating"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </Link>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
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
                                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
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
                {subscription && (subscription.status === 'ACTIVE' || subscription.isSubscribed) && !isExpired() && !isExpiringSoon() && (
                    <div className={`rounded-xl p-4 mb-6 ${subscription.type === 'VIP'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                            : subscription.type === 'PREMIUM'
                                ? 'bg-gradient-to-r from-pink-500 to-rose-600'
                                : 'bg-gradient-to-r from-gray-600 to-gray-700'
                        } text-white`}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                {subscription.type === 'VIP' && <Crown className="w-8 h-8" />}
                                {subscription.type === 'PREMIUM' && <Zap className="w-8 h-8" />}
                                {subscription.type === 'BASIC' && <Star className="w-8 h-8" />}
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        Active Subscription
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        {getDaysRemaining()} days remaining • Expires {new Date(subscription.expiresAt || subscription.endDate || '').toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.autoRenew ? 'bg-white/20' : 'bg-white/10'
                                    }`}>
                                    {subscription.autoRenew ? '✓ Auto-renew' : 'Auto-renew OFF'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expiring Soon Warning */}
                {isExpiringSoon() && subscription && (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">Subscription Expiring Soon!</h3>
                                <p className="text-sm text-yellow-100">
                                    Your {getCurrentPlan()?.name} plan expires in {getDaysRemaining()} days. Renew now to keep matching!
                                </p>
                            </div>
                            <Link
                                href="/subscription/dating"
                                className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
                            >
                                Renew Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Expired Notice */}
                {isExpired() && subscription && (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">Subscription Expired</h3>
                                <p className="text-sm text-red-100">
                                    Your subscription has expired. Renew to continue matching and messaging!
                                </p>
                            </div>
                            <Link
                                href="/subscription/dating"
                                className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
                            >
                                Reactivate
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


                {/* Subscription Details Card */}
                {subscription && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Subscription</h2>
                            <Link
                                href="/subscription/dating"
                                className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                            >
                                Manage
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-pink-100">
                                    <Zap className="w-6 h-6 text-pink-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Dating Subscription</h3>
                                    <p className="text-sm text-gray-600">
                                        KSh 300/year
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
                                    <p className="text-gray-500">Subscription Started</p>
                                    <p className="font-medium text-gray-900">
                                        {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Expires</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(subscription.expiresAt || subscription.endDate || '').toLocaleDateString()}
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
                                <Link
                                    href="/subscription/dating"
                                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Renew Subscription
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Content */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Photos Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>

                        {!isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.photos && profile.photos.length > 0 ? (
                                    profile.photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                            <img
                                                src={getImageUrl(photo)}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-8 text-gray-500">
                                        No photos uploaded yet
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Existing photos */}
                                    {editedProfile.photos?.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={getImageUrl(photo)}
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
                                                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
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
                                    {((editedProfile.photos?.length || 0) + newPhotos.length) < 6 && (
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-pink-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
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
                                    Add up to 6 photos. The first photo will be your main profile picture.
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
                                    <div className="flex items-center gap-1 text-purple-500">
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
                                        {displayName}, {age}
                                    </h3>
                                    <div className="flex items-center text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>{locationStr}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Gender</p>
                                        <p className="text-gray-900 font-medium capitalize">{profile.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Looking For</p>
                                        <p className="text-gray-900 font-medium">{profile.lookingFor || 'Not specified'}</p>
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
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedProfile.name || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location (City)
                                    </label>
                                    <input
                                        type="text"
                                        name="locationCity"
                                        value={typeof editedProfile.location === 'object'
                                            ? (editedProfile.location as any)?.city || ''
                                            : editedProfile.location || ''}
                                        onChange={(e) => {
                                            setEditedProfile(prev => ({
                                                ...prev,
                                                location: {
                                                    ...(typeof prev.location === 'object' ? prev.location : {}),
                                                    city: e.target.value
                                                }
                                            }))
                                        }}
                                        placeholder="e.g., Nairobi"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Looking For
                                    </label>
                                    <input
                                        type="text"
                                        name="lookingFor"
                                        value={editedProfile.lookingFor || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Meaningful relationship"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* About Me */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>

                        {!isEditing ? (
                            <p className="text-gray-700 leading-relaxed">{profile.bio || 'No bio added yet.'}</p>
                        ) : (
                            <textarea
                                name="bio"
                                value={editedProfile.bio || ''}
                                onChange={handleInputChange}
                                rows={5}
                                placeholder="Tell others about yourself..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                            />
                        )}
                    </div>

                    {/* Interests */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Interests</h2>

                        {!isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.interests && profile.interests.length > 0 ? (
                                    profile.interests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                                        >
                                            {interest}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No interests added yet</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {interestOptions.map((interest) => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${editedProfile.interests?.includes(interest)
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>

                        {!isEditing ? (
                            <div className="space-y-4">
                                {profile.education && (
                                    <div className="flex items-start">
                                        <GraduationCap className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Education</p>
                                            <p className="text-gray-900 font-medium">{profile.education}</p>
                                        </div>
                                    </div>
                                )}
                                {profile.occupation && (
                                    <div className="flex items-start">
                                        <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Occupation</p>
                                            <p className="text-gray-900 font-medium">{profile.occupation}</p>
                                        </div>
                                    </div>
                                )}
                                {!profile.education && !profile.occupation && (
                                    <p className="text-gray-500">No additional information</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Education
                                    </label>
                                    <input
                                        type="text"
                                        name="education"
                                        value={editedProfile.education || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Bachelor's Degree"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Occupation
                                    </label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={editedProfile.occupation || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Software Engineer"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Link
                        href="/referral/wallet"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Wallet</h3>
                                <p className="text-sm text-gray-600">
                                    {wallet ? `KSh ${(wallet.currentBalance || wallet.balance || 0).toLocaleString()}` : 'View earnings'}
                                </p>
                            </div>
                            <CreditCard className="w-8 h-8 text-pink-500" />
                        </div>
                    </Link>

                    <Link
                        href="/subscription/dating"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Subscription</h3>
                                <p className="text-sm text-gray-600">KSh 300/year</p>
                            </div>
                            <Zap className="w-8 h-8 text-pink-500" />
                        </div>
                    </Link>

                    <Link
                        href="/referral"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Referral Program</h3>
                                <p className="text-sm text-gray-600">Earn 50% commission</p>
                                {wallet && (wallet.currentBalance || wallet.balance || 0) > 0 && (
                                    <p className="text-sm text-green-600 font-semibold mt-1">
                                        KSh {(wallet.currentBalance || wallet.balance || 0).toLocaleString()} earned
                                    </p>
                                )}
                            </div>
                            <Gift className="w-8 h-8 text-pink-500" />
                        </div>
                    </Link>
                </div>

                {/* Delete Account */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
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
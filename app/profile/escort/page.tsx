// app/profile/escort/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Edit2, Save, X, Upload, MapPin, Phone, Clock,
    DollarSign, Star, Eye, Crown, Check, Languages, Calendar,
    Gift, TrendingUp, ChevronRight, AlertCircle, Zap, Sparkles,
    CreditCard, RefreshCw
} from 'lucide-react'

// Mock escort data
const MOCK_ESCORT = {
    id: '1',
    firstName: 'Jessica',
    lastName: 'Smith',
    displayName: 'Jess',
    email: 'jessica@example.com',
    phone: '+254 712 345 678',
    contactPhone: '+254 798 765 432',
    dateOfBirth: '1996-03-20',
    age: 28,
    gender: 'female',
    city: 'Nairobi, Westlands',
    description: 'Elegant, sophisticated, and fun-loving companion. I specialize in providing unforgettable experiences with a perfect blend of charm and professionalism. Whether it\'s a dinner date or a private encounter, I ensure discretion and satisfaction.',
    languages: ['English', 'Swahili', 'French'],
    hourlyRate: '8000',
    photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    ],
    services: [
        'Girlfriend Experience (GFE)',
        'Massage',
        'Oral',
        'Dinner Date',
        'Travel Companion',
        'Overnight'
    ],
    availability: {
        monday: { available: true, from: '14:00', to: '23:00' },
        tuesday: { available: true, from: '14:00', to: '23:00' },
        wednesday: { available: true, from: '14:00', to: '23:00' },
        thursday: { available: true, from: '14:00', to: '23:00' },
        friday: { available: true, from: '12:00', to: '02:00' },
        saturday: { available: true, from: '12:00', to: '02:00' },
        sunday: { available: false, from: '', to: '' },
    },
    isVerified: true,
    stats: {
        views: 3456,
        unlocks: 234,
        rating: 4.8,
        reviews: 67
    },
    earnings: {
        thisMonth: 145000,
        lastMonth: 132000,
        total: 890000
    },
    // Subscription data
    subscription: {
        plan: 'professional', // 'starter', 'professional', 'vip', or null
        status: 'active', // 'active', 'expired', 'expiring_soon'
        expiresAt: '2025-02-15',
        startedAt: '2025-01-15',
        autoRenew: true
    },
    // Referral stats
    referralStats: {
        totalReferrals: 18,
        totalEarnings: 8400,
        pendingEarnings: 1200,
        thisMonth: 2800
    }
}

// Subscription plan details
const SUBSCRIPTION_PLANS = {
    starter: { name: 'Starter', price: 999, color: 'gray', icon: Star },
    professional: { name: 'Professional', price: 2499, color: 'purple', icon: Zap },
    vip: { name: 'VIP Elite', price: 4999, color: 'yellow', icon: Crown }
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

export default function EscortProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [escort, setEscort] = useState(MOCK_ESCORT)
    const [editedEscort, setEditedEscort] = useState(MOCK_ESCORT)
    const [newPhotos, setNewPhotos] = useState<File[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setEditedEscort(prev => ({ ...prev, [name]: value }))
    }

    const toggleService = (service: string) => {
        setEditedEscort(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }))
    }

    const toggleLanguage = (language: string) => {
        setEditedEscort(prev => ({
            ...prev,
            languages: prev.languages.includes(language)
                ? prev.languages.filter(l => l !== language)
                : [...prev.languages, language]
        }))
    }

    const toggleDayAvailability = (day: keyof typeof escort.availability) => {
        setEditedEscort(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    available: !prev.availability[day].available
                }
            }
        }))
    }

    const updateDayTime = (day: keyof typeof escort.availability, field: 'from' | 'to', value: string) => {
        setEditedEscort(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    [field]: value
                }
            }
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setNewPhotos(prev => [...prev, ...files].slice(0, 4))
        }
    }

    const removePhoto = (index: number) => {
        setEditedEscort(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }))
    }

    const removeNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        setEscort(editedEscort)
        setIsEditing(false)
        console.log('Saved:', editedEscort)
    }

    const handleCancel = () => {
        setEditedEscort(escort)
        setNewPhotos([])
        setIsEditing(false)
    }

    // Subscription helpers
    const getDaysRemaining = () => {
        if (!escort.subscription.expiresAt) return 0
        const expiry = new Date(escort.subscription.expiresAt)
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

    const hasSubscription = () => {
        return escort.subscription.plan !== null
    }

    const getCurrentPlan = () => {
        if (!escort.subscription.plan) return null
        return SUBSCRIPTION_PLANS[escort.subscription.plan as keyof typeof SUBSCRIPTION_PLANS]
    }

    const isVIP = () => {
        return escort.subscription.plan === 'vip' && !isExpired()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/hookups"
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
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Subscription Status Banner */}
                {hasSubscription() && !isExpired() && !isExpiringSoon() && (
                    <div className={`rounded-xl p-4 mb-6 ${escort.subscription.plan === 'vip'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : escort.subscription.plan === 'professional'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                                : 'bg-gradient-to-r from-gray-700 to-gray-800'
                        } text-white`}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                {escort.subscription.plan === 'vip' && <Crown className="w-8 h-8" />}
                                {escort.subscription.plan === 'professional' && <Zap className="w-8 h-8" />}
                                {escort.subscription.plan === 'starter' && <Star className="w-8 h-8" />}
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {getCurrentPlan()?.name} Plan
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        {getDaysRemaining()} days remaining • Expires {new Date(escort.subscription.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${escort.subscription.autoRenew
                                        ? 'bg-white/20'
                                        : 'bg-white/10'
                                    }`}>
                                    {escort.subscription.autoRenew ? '✓ Auto-renew' : 'Auto-renew OFF'}
                                </span>
                                <Link
                                    href="/subscription/escort"
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {escort.subscription.plan === 'vip' ? 'Manage' : 'Upgrade'}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expiring Soon Warning */}
                {hasSubscription() && isExpiringSoon() && (
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
                {hasSubscription() && isExpired() && (
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
                                    KSh {escort.referralStats.totalEarnings.toLocaleString()}
                                </p>
                                <p className="text-xs text-green-100">
                                    {escort.referralStats.totalReferrals} referrals • KSh {escort.referralStats.thisMonth.toLocaleString()} this month
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </div>
                </Link>

                {/* Earnings Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">This Month</p>
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            KSh {escort.earnings.thisMonth.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Escort bookings</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Last Month</p>
                            <DollarSign className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            KSh {escort.earnings.lastMonth.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Escort bookings</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Earnings</p>
                            <DollarSign className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            KSh {escort.earnings.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{escort.stats.views}</p>
                        <p className="text-sm text-gray-600">Views</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Phone className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{escort.stats.unlocks}</p>
                        <p className="text-sm text-gray-600">Unlocks</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Star className="w-6 h-6 text-purple-500 mx-auto mb-2 fill-current" />
                        <p className="text-2xl font-bold text-gray-900">{escort.stats.rating}</p>
                        <p className="text-sm text-gray-600">Rating</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <div className="w-6 h-6 text-purple-500 mx-auto mb-2 flex items-center justify-center text-xl">
                            💬
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{escort.stats.reviews}</p>
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

                    {hasSubscription() ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${escort.subscription.plan === 'vip' ? 'bg-yellow-100' :
                                        escort.subscription.plan === 'professional' ? 'bg-purple-100' : 'bg-gray-100'
                                    }`}>
                                    {escort.subscription.plan === 'vip' && <Crown className="w-6 h-6 text-yellow-600" />}
                                    {escort.subscription.plan === 'professional' && <Zap className="w-6 h-6 text-purple-600" />}
                                    {escort.subscription.plan === 'starter' && <Star className="w-6 h-6 text-gray-600" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{getCurrentPlan()?.name} Plan</h3>
                                    <p className="text-sm text-gray-600">
                                        KSh {getCurrentPlan()?.price.toLocaleString()}/month
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isExpired()
                                        ? 'bg-red-100 text-red-700'
                                        : isExpiringSoon()
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                    {isExpired() ? 'Expired' : isExpiringSoon() ? 'Expiring Soon' : 'Active'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Started</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(escort.subscription.startedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Expires</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(escort.subscription.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Auto-renew</p>
                                    <p className={`font-medium ${escort.subscription.autoRenew ? 'text-green-600' : 'text-gray-900'}`}>
                                        {escort.subscription.autoRenew ? 'Enabled' : 'Disabled'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Days Remaining</p>
                                    <p className={`font-medium ${isExpiringSoon() ? 'text-yellow-600' : isExpired() ? 'text-red-600' : 'text-gray-900'}`}>
                                        {getDaysRemaining() > 0 ? getDaysRemaining() : 0} days
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {escort.subscription.plan !== 'vip' && (
                                    <Link
                                        href="/subscription/escort"
                                        className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-medium text-center hover:bg-purple-600 transition-colors"
                                    >
                                        Upgrade Plan
                                    </Link>
                                )}
                                <Link
                                    href="/subscription/escort"
                                    className={`py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${escort.subscription.plan === 'vip' ? 'flex-1' : ''
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
                                {escort.photos.map((photo, index) => (
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
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {editedEscort.photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={photo}
                                                alt={`Photo ${index + 1}`}
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
                                                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}

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
                                        </div>
                                    ))}

                                    {(editedEscort.photos.length + newPhotos.length) < 4 && (
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
                                {escort.isVerified && (
                                    <div className="flex items-center gap-1 text-blue-500">
                                        <Check className="w-5 h-5" />
                                        <span className="text-sm font-medium">Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {escort.displayName}, {escort.age}
                                    </h3>
                                    <div className="flex items-center text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>{escort.city}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Gender</p>
                                        <p className="text-gray-900 font-medium capitalize">{escort.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                                        <p className="text-gray-900 font-medium">KSh {parseInt(escort.hourlyRate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Contact Phone</p>
                                        <p className="text-gray-900 font-medium">{escort.contactPhone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900 font-medium">{escort.email}</p>
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
                                        value={editedEscort.displayName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={editedEscort.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="female">Female</option>
                                            <option value="male">Male</option>
                                            <option value="trans-female">Trans Female</option>
                                            <option value="trans-male">Trans Male</option>
                                            <option value="non-binary">Non-binary</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hourly Rate (KSh)
                                        </label>
                                        <input
                                            type="number"
                                            name="hourlyRate"
                                            value={editedEscort.hourlyRate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City / Location
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={editedEscort.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Phone (For Clients)
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={editedEscort.contactPhone}
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
                            <p className="text-gray-700 leading-relaxed">{escort.description}</p>
                        ) : (
                            <textarea
                                name="description"
                                value={editedEscort.description}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                        )}
                    </div>

                    {/* Services */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>

                        {!isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {escort.services.map((service) => (
                                    <div
                                        key={service}
                                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                                    >
                                        {service}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {serviceOptions.map((service) => (
                                    <button
                                        key={service}
                                        type="button"
                                        onClick={() => toggleService(service)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${editedEscort.services.includes(service)
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
                                {escort.languages.map((language) => (
                                    <div
                                        key={language}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                    >
                                        <Languages className="w-4 h-4" />
                                        {language}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {languageOptions.map((language) => (
                                    <button
                                        key={language}
                                        type="button"
                                        onClick={() => toggleLanguage(language)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${editedEscort.languages.includes(language)
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
                                {Object.entries(escort.availability).map(([day, schedule]) => (
                                    <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-900 capitalize min-w-[100px]">
                                            {day}
                                        </span>
                                        {schedule.available ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Clock className="w-4 h-4 text-purple-500" />
                                                <span>{schedule.from} - {schedule.to}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">Not available</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(editedEscort.availability).map(([day, schedule]) => (
                                    <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <label className="flex items-center min-w-[100px]">
                                            <input
                                                type="checkbox"
                                                checked={schedule.available}
                                                onChange={() => toggleDayAvailability(day as keyof typeof escort.availability)}
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
                                                    onChange={(e) => updateDayTime(day as keyof typeof escort.availability, 'from', e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                                <span className="text-gray-500">to</span>
                                                <input
                                                    type="time"
                                                    value={schedule.to}
                                                    onChange={(e) => updateDayTime(day as keyof typeof escort.availability, 'to', e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Link
                        href="/wallet"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Wallet & Earnings</h3>
                                <p className="text-sm text-gray-600">Manage your finances</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-purple-500" />
                        </div>
                    </Link>

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
                                <h3 className="font-semibold text-gray-900 mb-1">Referral Program</h3>
                                <p className="text-sm text-gray-600">Earn 30% commission</p>
                                {escort.referralStats.totalEarnings > 0 && (
                                    <p className="text-sm text-green-600 font-semibold mt-1">
                                        KSh {escort.referralStats.totalEarnings.toLocaleString()} earned
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
                    <button className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                        Delete Account
                    </button>
                </div>
            </main>
        </div>
    )
}
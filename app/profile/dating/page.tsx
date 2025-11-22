// app/profile/dating/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Edit2, Save, X, Upload, MapPin, Briefcase,
    GraduationCap, Heart, MessageCircle, Check, Gift,
    Crown, Star, Zap, AlertCircle, ChevronRight, RefreshCw,
    CreditCard, Clock, Sparkles
} from 'lucide-react'

// Subscription plan details
const SUBSCRIPTION_PLANS = {
    basic: { name: 'Basic', price: 499, color: 'gray', icon: Star },
    premium: { name: 'Premium', price: 999, color: 'pink', icon: Zap },
    vip: { name: 'VIP', price: 2499, color: 'purple', icon: Crown }
}

// Mock user data
const MOCK_USER = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah J.',
    email: 'sarah.johnson@example.com',
    phone: '+254 712 345 678',
    dateOfBirth: '1995-06-15',
    age: 28,
    gender: 'female',
    sexualOrientation: 'straight',
    lookingFor: 'men',
    city: 'Nairobi',
    country: 'Kenya',
    bio: 'Avid traveler, book lover, and coffee enthusiast. Looking for someone to share adventures with. Love hiking, photography, and trying new restaurants.',
    interests: ['Travel', 'Reading', 'Photography', 'Hiking', 'Coffee', 'Food'],
    education: "Bachelor's in Business Administration",
    occupation: 'Marketing Manager',
    photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80',
    ],
    isVerified: true,
    stats: {
        matches: 24,
        likes: 156,
        profileViews: 1234
    },
    // Subscription data
    subscription: {
        plan: 'premium', // 'basic', 'premium', 'vip'
        status: 'active', // 'active', 'expired', 'expiring_soon'
        expiresAt: '2025-02-10',
        startedAt: '2025-01-10',
        autoRenew: false
    },
    // Referral stats
    referralStats: {
        totalReferrals: 12,
        totalEarnings: 3600,
        pendingEarnings: 450
    }
}

const interestOptions = [
    'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking',
    'Fitness', 'Photography', 'Dancing', 'Gaming', 'Art', 'Fashion',
    'Nature', 'Technology', 'Food', 'Pets', 'Yoga', 'Hiking', 'Coffee'
]

export default function DatingProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [user, setUser] = useState(MOCK_USER)
    const [editedUser, setEditedUser] = useState(MOCK_USER)
    const [newPhotos, setNewPhotos] = useState<File[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setEditedUser(prev => ({ ...prev, [name]: value }))
    }

    const toggleInterest = (interest: string) => {
        setEditedUser(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setNewPhotos(prev => [...prev, ...files].slice(0, 6))
        }
    }

    const removePhoto = (index: number) => {
        setEditedUser(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }))
    }

    const removeNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        setUser(editedUser)
        setIsEditing(false)
        console.log('Saved:', editedUser)
    }

    const handleCancel = () => {
        setEditedUser(user)
        setNewPhotos([])
        setIsEditing(false)
    }

    // Subscription helpers
    const getDaysRemaining = () => {
        if (!user.subscription.expiresAt) return 0
        const expiry = new Date(user.subscription.expiresAt)
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
        if (!user.subscription.plan) return null
        return SUBSCRIPTION_PLANS[user.subscription.plan as keyof typeof SUBSCRIPTION_PLANS]
    }

    const isVIP = () => {
        return user.subscription.plan === 'vip' && !isExpired()
    }

    const isPremium = () => {
        return (user.subscription.plan === 'premium' || user.subscription.plan === 'vip') && !isExpired()
    }

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
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
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
                {/* Subscription Status Banner - Active */}
                {!isExpired() && !isExpiringSoon() && (
                    <div className={`rounded-xl p-4 mb-6 ${user.subscription.plan === 'vip'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                            : user.subscription.plan === 'premium'
                                ? 'bg-gradient-to-r from-pink-500 to-rose-600'
                                : 'bg-gradient-to-r from-gray-600 to-gray-700'
                        } text-white`}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                {user.subscription.plan === 'vip' && <Crown className="w-8 h-8" />}
                                {user.subscription.plan === 'premium' && <Zap className="w-8 h-8" />}
                                {user.subscription.plan === 'basic' && <Star className="w-8 h-8" />}
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {getCurrentPlan()?.name} Member
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        {getDaysRemaining()} days remaining • Expires {new Date(user.subscription.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.subscription.autoRenew
                                        ? 'bg-white/20'
                                        : 'bg-white/10'
                                    }`}>
                                    {user.subscription.autoRenew ? '✓ Auto-renew' : 'Auto-renew OFF'}
                                </span>
                                <Link
                                    href="/subscription/dating"
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {user.subscription.plan === 'vip' ? 'Manage' : 'Upgrade'}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expiring Soon Warning */}
                {isExpiringSoon() && (
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
                {isExpired() && (
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
                {user.referralStats.totalEarnings > 0 && (
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
                                        KSh {user.referralStats.totalEarnings.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-100">
                                        {user.referralStats.totalReferrals} referrals • KSh {user.referralStats.pendingEarnings} pending
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </div>
                    </Link>
                )}

                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{user.stats.matches}</p>
                        <p className="text-sm text-gray-600">Matches</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <MessageCircle className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{user.stats.likes}</p>
                        <p className="text-sm text-gray-600">Likes</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <div className="w-6 h-6 text-pink-500 mx-auto mb-2 flex items-center justify-center">
                            👁️
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{user.stats.profileViews}</p>
                        <p className="text-sm text-gray-600">Views</p>
                    </div>
                </div>

                {/* Subscription Details Card */}
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
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.subscription.plan === 'vip' ? 'bg-purple-100' :
                                    user.subscription.plan === 'premium' ? 'bg-pink-100' : 'bg-gray-100'
                                }`}>
                                {user.subscription.plan === 'vip' && <Crown className="w-6 h-6 text-purple-600" />}
                                {user.subscription.plan === 'premium' && <Zap className="w-6 h-6 text-pink-600" />}
                                {user.subscription.plan === 'basic' && <Star className="w-6 h-6 text-gray-600" />}
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
                                    {new Date(user.subscription.startedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Expires</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(user.subscription.expiresAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Auto-renew</p>
                                <p className={`font-medium ${user.subscription.autoRenew ? 'text-green-600' : 'text-gray-900'}`}>
                                    {user.subscription.autoRenew ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Days Remaining</p>
                                <p className={`font-medium ${isExpiringSoon() ? 'text-yellow-600' : isExpired() ? 'text-red-600' : 'text-gray-900'}`}>
                                    {getDaysRemaining() > 0 ? getDaysRemaining() : 0} days
                                </p>
                            </div>
                        </div>

                        {/* Plan Benefits */}
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">Your Benefits:</p>
                            <div className="flex flex-wrap gap-2">
                                {user.subscription.plan === 'basic' && (
                                    <>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">50 Likes/day</span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">See who likes you</span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Basic matching</span>
                                    </>
                                )}
                                {user.subscription.plan === 'premium' && (
                                    <>
                                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">Unlimited Likes</span>
                                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">Advanced matching</span>
                                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">Weekly boost</span>
                                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">5 free unlocks/mo</span>
                                    </>
                                )}
                                {user.subscription.plan === 'vip' && (
                                    <>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Unlimited Likes</span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Unlimited unlocks</span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Daily boost</span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">VIP badge</span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Exclusive events</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {user.subscription.plan !== 'vip' && (
                                <Link
                                    href="/subscription/dating"
                                    className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-medium text-center hover:bg-pink-600 transition-colors"
                                >
                                    Upgrade Plan
                                </Link>
                            )}
                            <Link
                                href="/subscription/dating"
                                className={`py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${user.subscription.plan === 'vip' ? 'flex-1' : ''
                                    }`}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Renew
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Photos Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>

                        {!isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {user.photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                        <img
                                            src={photo}
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                                                Main
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {editedUser.photos.map((photo, index) => (
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
                                                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
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

                                    {(editedUser.photos.length + newPhotos.length) < 6 && (
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
                                {user.isVerified && (
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
                                        {user.displayName || `${user.firstName} ${user.lastName}`}, {user.age}
                                    </h3>
                                    <div className="flex items-center text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>{user.city}, {user.country}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Gender</p>
                                        <p className="text-gray-900 font-medium capitalize">{user.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Looking For</p>
                                        <p className="text-gray-900 font-medium capitalize">{user.lookingFor}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Orientation</p>
                                        <p className="text-gray-900 font-medium capitalize">{user.sexualOrientation}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900 font-medium">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editedUser.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editedUser.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={editedUser.displayName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={editedUser.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        >
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
                                            value={editedUser.sexualOrientation}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        >
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
                                        Looking For
                                    </label>
                                    <select
                                        name="lookingFor"
                                        value={editedUser.lookingFor}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    >
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                        <option value="everyone">Everyone</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={editedUser.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={editedUser.country}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* About Me */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>

                        {!isEditing ? (
                            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                        ) : (
                            <textarea
                                name="bio"
                                value={editedUser.bio}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                            />
                        )}
                    </div>

                    {/* Interests */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Interests</h2>

                        {!isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {interestOptions.map((interest) => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${editedUser.interests.includes(interest)
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
                                {user.education && (
                                    <div className="flex items-start">
                                        <GraduationCap className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Education</p>
                                            <p className="text-gray-900 font-medium">{user.education}</p>
                                        </div>
                                    </div>
                                )}
                                {user.occupation && (
                                    <div className="flex items-start">
                                        <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Occupation</p>
                                            <p className="text-gray-900 font-medium">{user.occupation}</p>
                                        </div>
                                    </div>
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
                                        value={editedUser.education}
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
                                        value={editedUser.occupation}
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
                        href="/wallet"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Wallet</h3>
                                <p className="text-sm text-gray-600">Manage earnings</p>
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
                                <p className="text-sm text-gray-600">{getCurrentPlan()?.name} Plan</p>
                            </div>
                            <Crown className="w-8 h-8 text-pink-500" />
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
                                {user.referralStats.totalReferrals > 0 && (
                                    <p className="text-sm text-green-600 font-semibold mt-1">
                                        KSh {user.referralStats.totalEarnings.toLocaleString()} earned
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
                    <button className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                        Delete Account
                    </button>
                </div>
            </main>
        </div>
    )
}
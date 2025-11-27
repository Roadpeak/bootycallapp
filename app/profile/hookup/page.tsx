// app/profile/hookup/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Edit2, Save, X, Heart, Eye, Lock, Unlock,
    Phone, Mail, Shield, Gift, TrendingUp, ChevronRight,
    AlertCircle, RefreshCw, Loader2
} from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { User, WalletSummary, ReferralCode } from '@/services/butical-api-service'

export default function HookupProfilePage() {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // User data
    const [user, setUser] = useState<User | null>(null)
    const [editedUser, setEditedUser] = useState<Partial<User>>({})
    const [wallet, setWallet] = useState<WalletSummary | null>(null)
    const [referralCode, setReferralCode] = useState<ReferralCode | null>(null)

    // Stats (TODO: Get from API when available)
    const [stats] = useState({
        favorites: 0,
        unlocked: 0,
        views: 0
    })

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

            // Fetch user data
            const userResponse = await ButicalAPI.users.getMe()

            // API wraps responses in { status, data: T } - unwrap if needed
            const unwrap = <T,>(response: any): T => {
                if (response?.data !== undefined && response?.status !== undefined) {
                    return response.data as T
                }
                return response as T
            }

            setUser(unwrap(userResponse.data))
            setEditedUser(unwrap(userResponse.data))

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEditedUser(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            setError(null)

            // Prepare update data
            const updateData: Partial<User> = {
                email: editedUser.email,
                phone: editedUser.phone,
                displayName: editedUser.displayName,
                firstName: editedUser.firstName,
                lastName: editedUser.lastName
            }

            console.log('Sending hookup user update:', updateData)

            // Update user via API
            const response = await ButicalAPI.users.updateMe(updateData)
            console.log('Hookup user update response:', response)

            // Unwrap response if needed (API may wrap in { status, data })
            const responseData = response.data as any
            const updatedUser = responseData?.data || responseData
            setUser(updatedUser)
            setEditedUser(updatedUser)
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
        setEditedUser(user || {})
        setError(null)
        setIsEditing(false)
    }

    const calculateDaysSinceJoin = () => {
        if (!user?.createdAt) return 0
        const joined = new Date(user.createdAt)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - joined.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const isPremium = () => {
        // Check if user has any active subscription
        return false // TODO: Implement subscription check
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
    if (error && !user) {
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

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No profile found</p>
                </div>
            </div>
        )
    }

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

                {/* Upgrade Banner */}
                {!isPremium() && (
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-lg font-bold mb-2">Upgrade to Dating Subscription</h3>
                                <p className="text-sm text-pink-100 mb-3">
                                    Get unlimited access to all escort contacts without unlock fees
                                </p>
                                <ul className="text-sm space-y-1">
                                    <li className="flex items-center gap-2">
                                        <Unlock className="w-4 h-4" />
                                        <span>Free access to all contacts</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        <span>Access to dating features</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>Priority support</span>
                                    </li>
                                </ul>
                            </div>
                            <Link
                                href="/subscription/dating"
                                className="px-6 py-3 bg-white text-pink-600 rounded-lg hover:bg-pink-50 font-semibold transition-colors whitespace-nowrap"
                            >
                                Upgrade Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Referral Earnings Banner */}
                {wallet && (wallet.currentBalance || wallet.balance || 0) > 0 && (
                    <Link
                        href="/referral"
                        className="block bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4 mb-6 hover:shadow-lg transition-shadow"
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

                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
                        <p className="text-sm text-gray-600">Favorites</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Unlock className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{stats.unlocked}</p>
                        <p className="text-sm text-gray-600">Unlocked</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Eye className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
                        <p className="text-sm text-gray-600">Profile Views</p>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Account Info */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>

                        {!isEditing ? (
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900 font-medium">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-gray-900 font-medium">{user.phone || 'Not set'}</p>
                                    </div>
                                </div>

                                {user.displayName && (
                                    <div className="flex items-start">
                                        <div className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex items-center justify-center text-lg">
                                            👤
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Display Name</p>
                                            <p className="text-gray-900 font-medium">{user.displayName}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start">
                                    <div className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex items-center justify-center text-lg">
                                        👤
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="text-gray-900 font-medium">
                                            {user.firstName} {user.lastName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start pt-4 border-t">
                                    <div className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex items-center justify-center">
                                        📅
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Member since</p>
                                        <p className="text-gray-900 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()} ({calculateDaysSinceJoin()} days ago)
                                        </p>
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
                                            value={editedUser.firstName || ''}
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
                                            value={editedUser.lastName || ''}
                                            onChange={handleInputChange}
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
                                        value={editedUser.displayName || ''}
                                        onChange={handleInputChange}
                                        placeholder="How others will see you"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedUser.email || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editedUser.phone || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>

                        <button
                            onClick={() => {
                                // TODO: Implement password change
                                alert('Password change not yet implemented')
                            }}
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Change Password
                        </button>
                    </div>

                    {/* Activity */}
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>

                        <div className="space-y-3">
                            <Link
                                href="/favorites"
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-pink-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">My Favorites</p>
                                        <p className="text-sm text-gray-600">{stats.favorites} escorts saved</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </Link>

                            <Link
                                href="/unlocked"
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Unlock className="w-5 h-5 text-purple-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Unlocked Contacts</p>
                                        <p className="text-sm text-gray-600">{stats.unlocked} contacts accessed</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </Link>

                            <Link
                                href="/referral"
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <Gift className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Referral Program</p>
                                        <p className="text-sm text-gray-600">
                                            Invite friends & earn rewards
                                        </p>
                                        {wallet && (wallet.currentBalance || wallet.balance || 0) > 0 && (
                                            <p className="text-sm text-purple-600 font-semibold mt-1">
                                                KSh {(wallet.currentBalance || wallet.balance || 0).toLocaleString()} earned
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-purple-400" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Referral Program Card */}
                {(!wallet || (wallet.currentBalance || wallet.balance || 0) === 0) && (
                    <Link
                        href="/referral"
                        className="block bg-white rounded-lg shadow-sm p-6 mt-6 hover:shadow-md transition-shadow border-2 border-purple-200"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Start Earning with Referrals</h3>
                                    <p className="text-sm text-gray-600">
                                        Earn KSh 250 for each friend you refer • 50% commission on all payments
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                        </div>
                    </Link>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Link
                        href="/wallet"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Wallet</h3>
                                <p className="text-sm text-gray-600">
                                    {wallet ? `KSh ${(wallet.currentBalance || wallet.balance || 0).toLocaleString()}` : 'View earnings'}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-pink-500" />
                        </div>
                    </Link>

                    <Link
                        href="/subscription/dating"
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Upgrade Account</h3>
                                <p className="text-sm text-gray-600">Unlock premium features</p>
                            </div>
                            <Shield className="w-8 h-8 text-pink-500" />
                        </div>
                    </Link>
                </div>

                {/* Delete Account */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently removed.
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
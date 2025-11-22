// app/profile/hookup/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Edit2, Save, X, Heart, Eye, Lock, Unlock,
    Phone, Mail, Shield, Gift, TrendingUp, ChevronRight
} from 'lucide-react'

// Mock hookup user data
const MOCK_HOOKUP_USER = {
    id: '1',
    email: 'john.doe@example.com',
    phone: '+254 712 345 678',
    displayName: 'John D.',
    joinedDate: '2024-10-15',
    stats: {
        favorites: 12,
        unlocked: 8,
        views: 45
    },
    isPremium: false,
    // Referral stats
    referralStats: {
        totalReferrals: 6,
        totalEarnings: 1800,
        pendingEarnings: 270
    }
}

export default function HookupProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [user, setUser] = useState(MOCK_HOOKUP_USER)
    const [editedUser, setEditedUser] = useState(MOCK_HOOKUP_USER)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEditedUser(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = () => {
        setUser(editedUser)
        setIsEditing(false)
        console.log('Saved:', editedUser)
    }

    const handleCancel = () => {
        setEditedUser(user)
        setIsEditing(false)
    }

    const calculateDaysSinceJoin = () => {
        const joined = new Date(user.joinedDate)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - joined.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
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
                {/* Upgrade Banner */}
                {!user.isPremium && (
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
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
                                href="/subscription"
                                className="px-6 py-3 bg-white text-pink-600 rounded-lg hover:bg-pink-50 font-semibold transition-colors whitespace-nowrap"
                            >
                                Upgrade Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Referral Earnings Banner */}
                {user.referralStats.totalEarnings > 0 && (
                    <Link
                        href="/referral"
                        className="block bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 mb-6 hover:shadow-lg transition-shadow"
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
                                    <p className="text-xs text-purple-100">
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
                        <p className="text-2xl font-bold text-gray-900">{user.stats.favorites}</p>
                        <p className="text-sm text-gray-600">Favorites</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Unlock className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{user.stats.unlocked}</p>
                        <p className="text-sm text-gray-600">Unlocked</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <Eye className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{user.stats.views}</p>
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
                                        <p className="text-gray-900 font-medium">{user.phone}</p>
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

                                <div className="flex items-start pt-4 border-t">
                                    <div className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex items-center justify-center">
                                        📅
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Member since</p>
                                        <p className="text-gray-900 font-medium">
                                            {new Date(user.joinedDate).toLocaleDateString()} ({calculateDaysSinceJoin()} days ago)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedUser.email}
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
                                        value={editedUser.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={editedUser.displayName}
                                        onChange={handleInputChange}
                                        placeholder="How others will see you"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>

                        <button className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
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
                                        <p className="text-sm text-gray-600">{user.stats.favorites} escorts saved</p>
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
                                        <p className="text-sm text-gray-600">{user.stats.unlocked} contacts accessed</p>
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
                                        {user.referralStats.totalEarnings > 0 && (
                                            <p className="text-sm text-purple-600 font-semibold mt-1">
                                                KSh {user.referralStats.totalEarnings.toLocaleString()} earned
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
                {user.referralStats.totalEarnings === 0 && (
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
                                        Earn KSh 250 for each friend you refer • 30% commission on all payments
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                        </div>
                    </Link>
                )}

                {/* Delete Account */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <button className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                        Delete Account
                    </button>
                </div>
            </main>
        </div>
    )
}
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, RefreshCw, AlertCircle, Loader2, Lock } from 'lucide-react'
import { DatingCard } from '@/app/components/cards/DatingCard'
import type { ProfileData } from '@/app/components/cards/EscortCard'
import type { DatingProfile } from '@/services/butical-api-service'
import { useDatingSuggested, useAuth, useSubscription } from '@/lib/hooks/butical-api-hooks'
import { TokenService } from '@/services/butical-api-service'

export default function SuggestedProfilesPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { hasDatingAccess } = useSubscription()
    const [limit] = useState(20)

    // Fetch AI suggested profiles
    const { suggested, loading, error, refetch } = useDatingSuggested(limit)

    useEffect(() => {
        const token = TokenService.getAccessToken()
        if (!token) {
            router.push('/auth/login')
            return
        }
    }, [router])

    // Helper to get display name from dating profile
    const getDisplayName = (profile: DatingProfile): string => {
        if (profile.name) return profile.name
        if (profile.user) {
            return profile.user.displayName || profile.user.firstName || 'Anonymous'
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

    // Transform dating profile to ProfileData
    const transformProfile = (profile: DatingProfile): ProfileData => ({
        id: profile.id,
        name: getDisplayName(profile),
        age: profile.age || calculateAge(profile.dateOfBirth),
        distance: 0,
        bio: profile.bio || '',
        photos: profile.photos && profile.photos.length > 0
            ? profile.photos
            : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
        isVerified: profile.isVerified || false,
        isLiked: false,
        tags: profile.interests || [],
    })

    const handleLike = async (profileId: string) => {
        console.log('Like toggled for profile:', profileId)
    }

    const handleMessage = (profileId: string) => {
        router.push(`/chat/${profileId}`)
    }

    const handleViewProfile = (profileId: string) => {
        router.push(`/dating/profile/${profileId}`)
    }

    const profiles = (suggested || []).map(transformProfile)

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-pink-500" />
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">AI Suggestions</h1>
                        </div>
                        <button
                            onClick={() => refetch()}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Subscription Banner */}
            {!hasDatingAccess && (
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-1">Unlock AI-Powered Matches</h3>
                                    <p className="text-purple-100 text-sm mb-3">
                                        Get personalized profile suggestions based on compatibility scoring!
                                    </p>
                                    <Link
                                        href="/subscription/dating"
                                        className="inline-block px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors text-sm"
                                    >
                                        Subscribe Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="p-4 max-w-7xl mx-auto">
                {/* Coming Soon Banner - Show when no data and no loading */}
                {!loading && profiles.length === 0 && !error && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                                    AI Suggestions Coming Soon!
                                </h3>
                                <p className="text-yellow-700 text-sm mb-3">
                                    The backend API for AI-powered profile suggestions is being implemented.
                                    Once ready, you'll get personalized matches based on:
                                </p>
                                <ul className="text-yellow-600 text-sm space-y-1 ml-4">
                                    <li>• Gender & orientation compatibility (40 points)</li>
                                    <li>• Age range preferences (30 points)</li>
                                    <li>• Sexual orientation match (20 points)</li>
                                    <li>• Shared interests & hobbies (10 points)</li>
                                </ul>
                                <div className="mt-4 flex gap-3">
                                    <Link
                                        href="/dating"
                                        className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors text-sm"
                                    >
                                        Browse All Profiles
                                    </Link>
                                    <Link
                                        href="/profile/dating"
                                        className="inline-block px-4 py-2 border border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-50 font-medium transition-colors text-sm"
                                    >
                                        Update Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Banner */}
                {profiles.length > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-purple-900 mb-1">How AI Suggestions Work</h3>
                                <p className="text-purple-800 text-sm">
                                    Our AI analyzes your profile and preferences to suggest highly compatible matches based on:
                                </p>
                                <ul className="mt-2 text-purple-700 text-sm space-y-1 ml-4">
                                    <li>• Gender & orientation compatibility (40 points)</li>
                                    <li>• Age range preferences (30 points)</li>
                                    <li>• Sexual orientation match (20 points)</li>
                                    <li>• Shared interests & hobbies (10 points)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                            <p className="text-red-800 font-medium">Failed to load suggestions</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="w-full">
                                <div className="animate-pulse">
                                    <div className="bg-gray-300 aspect-[3/4] rounded-xl mb-2"></div>
                                    <div className="bg-gray-300 h-4 rounded-md w-3/4 mb-2"></div>
                                    <div className="bg-gray-300 h-3 rounded-md w-1/2 mb-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : profiles.length > 0 ? (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {profiles.length} suggested {profiles.length === 1 ? 'profile' : 'profiles'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                <span>AI-powered matches</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {profiles.map(profile => (
                                <DatingCard
                                    key={profile.id}
                                    profile={profile}
                                    onLike={handleLike}
                                    onMessage={handleMessage}
                                    onView={handleViewProfile}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No suggestions available yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Complete your profile and set your preferences to get personalized AI suggestions!
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link
                                href="/profile/dating"
                                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-colors"
                            >
                                Update Profile
                            </Link>
                            <Link
                                href="/dating"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Browse All Profiles
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Users, Eye, Loader2, AlertCircle } from 'lucide-react'
import { DatingCard } from '@/app/components/cards/DatingCard'
import type { ProfileData } from '@/app/components/cards/EscortCard'
import type { DatingProfile } from '@/services/butical-api-service'
import { useDatingMatches, useDatingLikes, useDatingLikedBy, useAuth, useSubscription } from '@/lib/hooks/butical-api-hooks'
import { TokenService } from '@/services/butical-api-service'

type ActivityTab = 'matches' | 'likes' | 'liked-by'

export default function DatingActivityPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<ActivityTab>('matches')
    const { user } = useAuth()
    const { hasDatingAccess } = useSubscription()

    // Fetch activity data
    const { matches, loading: matchesLoading, error: matchesError } = useDatingMatches()
    const { likes, loading: likesLoading, error: likesError } = useDatingLikes()
    const { likedBy, loading: likedByLoading, error: likedByError } = useDatingLikedBy()

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
    const transformProfile = (profile: DatingProfile, isLiked: boolean = true): ProfileData => ({
        id: profile.id,
        name: getDisplayName(profile),
        age: profile.age || calculateAge(profile.dateOfBirth),
        distance: 0,
        bio: profile.bio || '',
        photos: profile.photos && profile.photos.length > 0
            ? profile.photos
            : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
        isVerified: profile.isVerified || false,
        isLiked,
        tags: profile.interests || [],
    })

    const handleLike = async (profileId: string) => {
        // This will be handled by the DatingCard component
        console.log('Like toggled for profile:', profileId)
    }

    const handleMessage = (profileId: string) => {
        router.push(`/chat/${profileId}`)
    }

    const handleViewProfile = (profileId: string) => {
        router.push(`/dating/profile/${profileId}`)
    }

    const tabs = [
        { id: 'matches' as ActivityTab, label: 'Matches', icon: Heart, count: matches.length },
        { id: 'likes' as ActivityTab, label: 'Liked by Me', icon: Users, count: likes.length },
        { id: 'liked-by' as ActivityTab, label: 'Who Liked Me', icon: Eye, count: likedBy.length },
    ]

    const getCurrentData = () => {
        switch (activeTab) {
            case 'matches':
                return { data: matches, loading: matchesLoading, error: matchesError }
            case 'likes':
                return { data: likes, loading: likesLoading, error: likesError }
            case 'liked-by':
                return { data: likedBy, loading: likedByLoading, error: likedByError }
        }
    }

    const { data, loading, error } = getCurrentData()
    const profiles = (data || []).map(p => transformProfile(p, activeTab !== 'liked-by'))

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dating Activity</h1>
                        <div className="w-16"></div> {/* Spacer for centering */}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 relative ${
                                        activeTab === tab.id
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden md:inline">{tab.label}</span>
                                    <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                                    {tab.count > 0 && (
                                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            activeTab === tab.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-pink-100 text-pink-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </header>

            {/* Subscription Banner */}
            {!hasDatingAccess && (
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-1">Subscribe to Access Activity</h3>
                                    <p className="text-pink-100 text-sm mb-3">
                                        See your matches, who you liked, and who liked you!
                                    </p>
                                    <Link
                                        href="/subscription/dating"
                                        className="inline-block px-4 py-2 bg-white text-pink-600 rounded-lg hover:bg-pink-50 font-medium transition-colors text-sm"
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
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                        {activeTab === 'matches' && '💕 These are profiles where you both liked each other!'}
                        {activeTab === 'likes' && '❤️ Profiles you have liked. If they like you back, you\'ll get a match!'}
                        {activeTab === 'liked-by' && '👀 These profiles liked you! Like them back to create a match.'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                            <p className="text-red-800 font-medium">Failed to load {activeTab}</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(6)].map((_, index) => (
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
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            {activeTab === 'matches' && <Heart className="w-16 h-16 text-gray-300 mx-auto" />}
                            {activeTab === 'likes' && <Users className="w-16 h-16 text-gray-300 mx-auto" />}
                            {activeTab === 'liked-by' && <Eye className="w-16 h-16 text-gray-300 mx-auto" />}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {activeTab === 'matches' && 'No matches yet'}
                            {activeTab === 'likes' && 'You haven\'t liked anyone yet'}
                            {activeTab === 'liked-by' && 'No one has liked you yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {activeTab === 'matches' && 'Start liking profiles to get matches!'}
                            {activeTab === 'likes' && 'Browse profiles and like the ones you\'re interested in.'}
                            {activeTab === 'liked-by' && 'Keep your profile updated and active to get more visibility.'}
                        </p>
                        <Link
                            href="/dating"
                            className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors"
                        >
                            Browse Profiles
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}

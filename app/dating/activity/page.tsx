'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Users, Eye, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { DatingCard } from '@/app/components/cards/DatingCard'
import { MatchNotificationModal } from '@/app/components/common/MatchNotificationModal'
import type { ProfileData } from '@/app/components/cards/EscortCard'
import type { MatchNotification } from '@/app/components/types/chat'
import type { DatingProfile } from '@/services/butical-api-service'
import { useDatingMatches, useDatingLikes, useDatingLikedBy, useAuth, useSubscription } from '@/lib/hooks/butical-api-hooks'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'

type ActivityTab = 'matches' | 'likes' | 'liked-by'

export default function DatingActivityPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<ActivityTab>('matches')
    const { user } = useAuth()
    const { hasDatingAccess } = useSubscription()
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [newMatch, setNewMatch] = useState<MatchNotification | null>(null)

    // Fetch activity data
    const { matches, loading: matchesLoading, error: matchesError, refetch: refetchMatches } = useDatingMatches()
    const { likes, loading: likesLoading, error: likesError, refetch: refetchLikes } = useDatingLikes()
    const { likedBy, loading: likedByLoading, error: likedByError, refetch: refetchLikedBy } = useDatingLikedBy()

    // Create sets for quick lookup
    const likedProfileIds = new Set(likes.map(p => p.id))
    const likedByProfileIds = new Set(likedBy.map(p => p.id))

    // Find mutual likes that should be matches (profiles that are in both likes and likedBy)
    const mutualLikes = likes.filter(profile => likedByProfileIds.has(profile.id))

    // Combine backend matches with mutual likes detected on frontend
    const allMatches = [
        ...matches,
        ...mutualLikes.filter(ml => !matches.find(m => m.id === ml.id))
    ]

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
    const transformProfile = (profile: DatingProfile, isLiked: boolean = true, isMatched: boolean = false): ProfileData => {
        // Extract location from profile
        const location = profile.location as { city?: string; area?: string; country?: string } | undefined
        const cityDisplay = location?.city || location?.area || 'Location not set'

        return {
            id: profile.id,
            name: getDisplayName(profile),
            age: profile.age || calculateAge(profile.dateOfBirth),
            distance: cityDisplay,
            bio: profile.bio || '',
            photos: profile.photos && profile.photos.length > 0
                ? profile.photos
                : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
            isVerified: profile.isVerified || false,
            isLiked,
            isMatched,
            tags: profile.interests || [],
        }
    }

    const handleLike = async (profileId: string) => {
        try {
            // For "liked-by" tab, we want to like them back (creating a match)
            // For other tabs, toggle the like status
            if (activeTab === 'liked-by') {
                const response = await ButicalAPI.datingProfiles.like(profileId)
                // Check if it created a match
                const responseData = (response.data as any)?.data || response.data
                const matched = responseData?.matched || false
                console.log('Like back response:', { profileId, matched, responseData })

                // Show match notification if it's a match
                if (matched) {
                    const matchedProfile = likedBy.find(p => p.id === profileId)
                    if (matchedProfile) {
                        setNewMatch({
                            id: profileId,
                            matchedUser: {
                                id: matchedProfile.userId || '',
                                name: getDisplayName(matchedProfile),
                                age: matchedProfile.age || calculateAge(matchedProfile.dateOfBirth),
                                avatar: matchedProfile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
                                bio: matchedProfile.bio || ''
                            },
                            matchedAt: new Date(),
                            isNew: true
                        })
                        setShowMatchModal(true)
                    }
                }

                // Always refetch matches when liking back (might create a match)
                await refetchMatches()
                await refetchLikedBy()
            } else {
                // Check current profile data to see if liked
                const currentProfile = data?.find((p: DatingProfile) => p.id === profileId)
                if (currentProfile) {
                    // Toggle like status
                    await ButicalAPI.datingProfiles.unlike(profileId)
                } else {
                    const response = await ButicalAPI.datingProfiles.like(profileId)
                    // Check if it created a match
                    const responseData = (response.data as any)?.data || response.data
                    const matched = responseData?.matched || false
                    console.log('Like response:', { profileId, matched, responseData })

                    if (matched) {
                        // Refetch matches when a new match is created
                        await refetchMatches()
                    }
                }
            }

            // Refetch the data to update the UI
            if (activeTab === 'matches') {
                await refetchMatches()
            } else if (activeTab === 'likes') {
                await refetchLikes()
            } else if (activeTab === 'liked-by') {
                // Already refetched above
            }
        } catch (error: any) {
            console.error('Failed to like/unlike profile:', error)
        }
    }

    const handleMessage = (profileId: string) => {
        // Find the profile to get the user ID
        const profile = data?.find((p: DatingProfile) => p.id === profileId)
        if (profile && profile.userId) {
            // Use user ID for chat, not profile ID
            router.push(`/chat/${profile.userId}`)
        } else {
            console.error('Could not find user ID for profile:', profileId)
        }
    }

    const handleViewProfile = (profileId: string) => {
        router.push(`/dating/profile/${profileId}`)
    }

    // Create a set of matched profile IDs to filter them out from likes/liked-by
    const matchedIds = new Set(allMatches.map(m => m.id))

    // Filter out matched profiles from likes and liked-by
    const filteredLikes = likes.filter(profile => !matchedIds.has(profile.id))
    const filteredLikedBy = likedBy.filter(profile => !matchedIds.has(profile.id))

    const tabs = [
        { id: 'matches' as ActivityTab, label: 'Matches', icon: Heart, count: allMatches.length },
        { id: 'likes' as ActivityTab, label: 'Liked by Me', icon: Users, count: filteredLikes.length },
        { id: 'liked-by' as ActivityTab, label: 'Who Liked Me', icon: Eye, count: filteredLikedBy.length },
    ]

    const getCurrentData = () => {
        switch (activeTab) {
            case 'matches':
                return { data: allMatches, loading: matchesLoading, error: matchesError }
            case 'likes':
                return { data: filteredLikes, loading: likesLoading, error: likesError }
            case 'liked-by':
                return { data: filteredLikedBy, loading: likedByLoading, error: likedByError }
        }
    }

    const { data, loading, error } = getCurrentData()
    const profiles = (data || []).map(p => transformProfile(
        p,
        activeTab !== 'liked-by', // isLiked
        activeTab === 'matches' // isMatched - only true for matches tab
    ))

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Match Notification Modal */}
            {newMatch && (
                <MatchNotificationModal
                    show={showMatchModal}
                    match={newMatch}
                    onClose={() => {
                        setShowMatchModal(false)
                        setNewMatch(null)
                    }}
                    onSendMessage={() => {
                        setShowMatchModal(false)
                        if (newMatch.matchedUser.id) {
                            router.push(`/chat/${newMatch.matchedUser.id}`)
                        }
                    }}
                />
            )}

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

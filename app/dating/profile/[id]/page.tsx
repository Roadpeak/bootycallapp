// app/dating/profile/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, MapPin, Heart, MessageCircle, Check, Briefcase,
    GraduationCap, Share2, X, AlertCircle, Lock
} from 'lucide-react'
import ButicalAPI from '@/services/butical-api-service'
import type { DatingProfile } from '@/services/butical-api-service'
import { useSubscription, useAuth } from '@/lib/hooks/butical-api-hooks'
import { getImageUrl } from '@/lib/utils/image'
import ChatService from '@/services/chat-service'

export default function DatingProfileViewPage() {
    const params = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState<DatingProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
    const [isLiked, setIsLiked] = useState(false)
    const [showMatchModal, setShowMatchModal] = useState(false)

    // Check subscription and user info
    const { user } = useAuth()
    const { hasDatingAccess, loading: subscriptionLoading } = useSubscription()

    useEffect(() => {
        const fetchProfile = async () => {
            if (!params.id) return

            setIsLoading(true)
            setError(null)

            try {
                const profileId = params.id as string

                // Fetch profile using API service
                const profileResponse = await ButicalAPI.datingProfiles.getById(profileId)
                // Unwrap API response: { status, data: { ...profile } }
                const profileData = (profileResponse.data as any)?.data || profileResponse.data
                setProfile(profileData)

                // Record profile view
                try {
                    await ButicalAPI.datingProfiles.view(profileId)
                } catch (viewErr) {
                    // Silently fail view tracking
                    console.warn('Failed to record view:', viewErr)
                }

                // Check if current user has liked this profile
                try {
                    const likeStatus = await ButicalAPI.datingProfiles.getLikeStatus(profileId)
                    // Unwrap API response
                    const likeData = (likeStatus.data as any)?.data || likeStatus.data
                    setIsLiked(likeData.liked)
                } catch (likeErr) {
                    // User may not be logged in or endpoint may not exist yet
                    console.warn('Failed to get like status:', likeErr)
                    setIsLiked(false)
                }
            } catch (err: any) {
                console.error('Failed to fetch dating profile:', err)
                setError(err.response?.data?.message || err.message || 'Failed to load profile')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [params.id])

    const handleLike = async () => {
        if (!profile) return

        // Check if user has dating access
        if (!hasDatingAccess) {
            router.push('/subscription/dating')
            return
        }

        const wasLiked = isLiked
        setIsLiked(!wasLiked) // Optimistic update

        try {
            if (wasLiked) {
                // Unlike the profile
                await ButicalAPI.datingProfiles.unlike(profile.id)
            } else {
                // Like the profile
                const response = await ButicalAPI.datingProfiles.like(profile.id)
                // Unwrap API response
                const likeResult = (response.data as any)?.data || response.data
                // Check if it's a match
                if (likeResult.matched) {
                    setTimeout(() => {
                        setShowMatchModal(true)
                    }, 500)
                }
            }
        } catch (err: any) {
            // Revert on error
            console.error('Failed to update like:', err)
            setIsLiked(wasLiked)
        }
    }

    const handleMessage = async () => {
        if (!profile) return

        // Check if user has dating access
        if (!hasDatingAccess) {
            router.push('/subscription/dating')
            return
        }

        try {
            // Check if user can chat with this profile
            const accessCheck = await ChatService.checkChatAccess(profile.userId)

            if (!accessCheck.canChat) {
                // Redirect to subscription page if access denied
                router.push('/subscription/dating')
                return
            }

            // Start or get conversation
            const conversation = await ChatService.startConversation(profile.userId)
            router.push(`/chat/${conversation.id}`)
        } catch (err: any) {
            console.error('Failed to start conversation:', err)
            // If error is 403, redirect to subscription
            if (err.response?.status === 403) {
                router.push('/subscription/dating')
            } else {
                setError(err.response?.data?.message || 'Failed to start conversation')
            }
        }
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/dating"
                        className="block w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors"
                    >
                        Back to Dating
                    </Link>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <p className="text-gray-600">Profile not found</p>
                    {user && (
                        <p className="text-sm text-gray-500 mt-4">
                            Logged in as {user.role === 'ESCORT' ? 'Escort' : user.role === 'HOOKUP_USER' ? 'Hookup User' : 'User'}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/dating')}
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                    >
                        Back to Browse
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
                    <p className="text-gray-600 mb-6">This profile doesn't exist or has been removed.</p>
                    <button
                        onClick={() => router.push('/dating')}
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                    >
                        Back to Browse
                    </button>
                </div>
            </div>
        )
    }

    // Get display values
    const displayName = getDisplayName(profile)
    const age = profile.age || calculateAge(profile.dateOfBirth)
    const locationStr = getLocationString(profile)

    // Safe photo array
    const photos = Array.isArray(profile.photos) && profile.photos.length > 0
        ? profile.photos
        : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80']

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </button>

                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Photos & Info */}
                    <div className="lg:col-span-2">
                        {/* Main Photo */}
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-200 mb-4">
                            <img
                                src={getImageUrl(photos[selectedPhotoIndex])}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Photo Thumbnails */}
                        {photos.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {photos.map((photo: string, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedPhotoIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden ${selectedPhotoIndex === index
                                                ? 'ring-2 ring-pink-500'
                                                : 'opacity-60 hover:opacity-100'
                                            } transition-all`}
                                    >
                                        <img
                                            src={getImageUrl(photo)}
                                            alt={`${displayName} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* About */}
                        <div className="bg-white rounded-xl p-6 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {profile.bio || 'No bio provided yet.'}
                            </p>
                        </div>

                        {/* Interests */}
                        {profile.interests && profile.interests.length > 0 && (
                            <div className="bg-white rounded-xl p-6 mb-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Interests</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map((interest: string) => (
                                        <span
                                            key={interest}
                                            className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Looking For */}
                        {profile.lookingFor && (
                            <div className="bg-white rounded-xl p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Looking For</h2>
                                <p className="text-gray-700">{profile.lookingFor}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 sticky top-24">
                            {/* Name & Basic Info */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {displayName}, {age}
                                </h1>
                                <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{locationStr}</span>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Gender</span>
                                    <span className="text-gray-900 font-medium capitalize">
                                        {profile.gender}
                                    </span>
                                </div>
                                {profile.lookingFor && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Looking for</span>
                                        <span className="text-gray-900 font-medium">
                                            {profile.lookingFor}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Subscription Banner (if no access) */}
                            {!hasDatingAccess && (
                                <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                    <p className="text-xs text-pink-800 text-center">
                                        Subscribe to like profiles and send messages
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleLike}
                                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${isLiked
                                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                                            : 'border-2 border-pink-500 text-pink-500 hover:bg-pink-50'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    <span>{isLiked ? 'Liked' : hasDatingAccess ? 'Like' : 'Subscribe to Like'}</span>
                                </button>

                                <button
                                    onClick={handleMessage}
                                    className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{hasDatingAccess ? 'Send Message' : 'Subscribe to Message'}</span>
                                </button>
                            </div>

                            {/* Safety Notice */}
                            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-800">
                                    💡 Always meet in public places for first dates and let someone know where you're going.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Match Modal */}
            {showMatchModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setShowMatchModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="inline-block relative mb-4">
                                <div className="absolute inset-0 animate-ping">
                                    <Heart className="w-20 h-20 text-pink-500 fill-current opacity-75" />
                                </div>
                                <Heart className="w-20 h-20 text-pink-500 fill-current relative" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">It's a Match!</h2>
                            <p className="text-gray-600">
                                You and {displayName} liked each other
                            </p>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={getImageUrl(photos[0])}
                                alt={displayName}
                                className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-pink-100"
                            />
                            <h3 className="text-xl font-semibold text-gray-900">
                                {displayName}, {age}
                            </h3>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowMatchModal(false)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Keep Swiping
                            </button>
                            <button
                                onClick={() => {
                                    setShowMatchModal(false)
                                    handleMessage()
                                }}
                                className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
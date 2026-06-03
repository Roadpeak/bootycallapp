// app/dating/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MapPin, Heart, MessageCircle, AlertCircle, Lock, Sparkles, ChevronDown, X } from 'lucide-react'
import { DatingCard } from '../components/cards/DatingCard'
import { MatchNotificationModal } from '../components/common/MatchNotificationModal'
import MobileBottomNav from '../components/layout/MobileBottomNav'
import type { ProfileData } from '../components/cards/EscortCard'
import type { MatchNotification } from '../components/types/chat'
import { useDatingProfiles, useDatingMatches, useDatingLikes, useDatingLikedBy, useSubscription, useAuth } from '@/lib/hooks/butical-api-hooks'
import type { DatingProfile } from '@/services/butical-api-service'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import ChatService from '@/services/chat-service'

// All 47 counties in Kenya
const kenyanCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
    'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
    'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
    'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
    'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
    'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
    'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
    'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga',
    'Wajir', 'West Pokot'
]

const CompactReferralBanner = () => (
    <motion.div
        className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 shadow-lg shadow-pink-500/20 relative overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
    >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        <div className="relative flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Earn money for each friend you refer — and from every person they refer too!</span>
        </div>
        <Link
            href="/referral"
            className="relative text-xs bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap border border-white/20"
        >
            Learn More →
        </Link>
    </motion.div>
)

function DatingPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isLocationOpen, setIsLocationOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeView, setActiveView] = useState<'all' | 'matches'>('all')
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [newMatch, setNewMatch] = useState<MatchNotification | null>(null)
    const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set())
    const [unreadMessageCount, setUnreadMessageCount] = useState(0)
    const [selectedLocation, setSelectedLocation] = useState('Nairobi')
    const [filters, setFilters] = useState({
        location: 'Nairobi',
        minAge: undefined as number | undefined,
        maxAge: undefined as number | undefined,
        maxDistance: 50,
        gender: undefined as string | undefined,
    })

    // Check authentication - redirect if not logged in
    useEffect(() => {
        const token = TokenService.getAccessToken()
        if (!token) {
            router.push('/auth/login')
            return
        }
    }, [router])

    // Check URL query parameter for view mode
    useEffect(() => {
        const view = searchParams.get('view')
        if (view === 'matches') {
            setActiveView('matches')
        }
    }, [searchParams])

    // Check subscription and user info
    const { user } = useAuth()
    const { hasDatingAccess, loading: subscriptionLoading } = useSubscription()

    // Fetch dating profiles using the hook
    const { profiles: apiProfiles, loading: isLoading, error, refetch } = useDatingProfiles({
        location: filters.location,
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        gender: filters.gender,
    })

    // Fetch matches from API
    const { matches: apiMatches, loading: matchesLoading, refetch: refetchMatches } = useDatingMatches()

    // Fetch likes from API to track liked profiles
    const { likes: apiLikes, refetch: refetchLikes } = useDatingLikes()

    // Fetch who liked me to detect mutual likes
    const { likedBy: apiLikedBy } = useDatingLikedBy()

    // Safe profiles array
    const safeDatingProfiles = Array.isArray(apiProfiles) ? apiProfiles : []
    const safeMatches = Array.isArray(apiMatches) ? apiMatches : []
    const safeLikes = Array.isArray(apiLikes) ? apiLikes : []
    const safeLikedBy = Array.isArray(apiLikedBy) ? apiLikedBy : []

    // Update liked profiles state when API likes change
    useEffect(() => {
        const likedIds = new Set(safeLikes.map(profile => profile.id))
        setLikedProfiles(likedIds)
    }, [safeLikes])

    // Fetch unread message count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const conversations = await ChatService.getConversations()
                const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
                setUnreadMessageCount(totalUnread)
            } catch (err) {
                console.error('Failed to fetch unread message count:', err)
            }
        }

        fetchUnreadCount()
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    // Helper to get display name from dating profile
    const getDisplayName = (profile: DatingProfile): string => {
        if (profile.name) return profile.name
        // Check for displayName/firstName at top level (from matches/likes endpoints)
        if ((profile as any).displayName) return (profile as any).displayName
        if ((profile as any).firstName) return (profile as any).firstName
        // Check nested user object (from regular profiles)
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

    // Detect mutual likes that should be matches
    const likedByProfileIds = new Set(safeLikedBy.map(p => p.id))
    const mutualLikes = safeLikes.filter(profile => likedByProfileIds.has(profile.id))

    // Combine backend matches with mutual likes detected on frontend
    const allMatches = [
        ...safeMatches,
        ...mutualLikes.filter(ml => !safeMatches.find(m => m.id === ml.id))
    ]

    // Create a set of matched profile IDs for quick lookup (including mutual likes)
    const matchedProfileIds = new Set(allMatches.map(m => m.id))

    // Filter out the current user's own profile
    const filteredDatingProfiles = safeDatingProfiles.filter(profile => {
        // Filter out current user's profile by comparing user IDs
        if (user && profile.userId === user.id) {
            return false
        }
        return true
    })

    // Transform API data to ProfileData format
    const profiles: ProfileData[] = filteredDatingProfiles.map((profile: DatingProfile) => {
        // Extract location from profile
        const location = profile.location as { city?: string; area?: string; country?: string } | undefined

        return {
            id: profile.id,
            name: getDisplayName(profile),
            age: profile.age || calculateAge(profile.dateOfBirth),
            distance: location?.city || undefined,
            area: location?.area || undefined,
            country: location?.country || undefined,
            bio: profile.bio || '',
            photos: profile.photos && profile.photos.length > 0
                ? profile.photos
                : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
            isVerified: profile.isVerified || false,
            isLiked: likedProfiles.has(profile.id) || matchedProfileIds.has(profile.id),
            isMatched: matchedProfileIds.has(profile.id),
            tags: profile.interests || [],
        }
    })

    // Transform matches to ProfileData format (using allMatches which includes mutual likes)
    const matchProfiles: ProfileData[] = allMatches.map((profile: DatingProfile) => {
        // For matches/likes endpoints, data might be nested in datingProfile
        const datingProfile = (profile as any).datingProfile || profile

        // Extract location from profile or datingProfile
        const location = (datingProfile.location || profile.location) as { city?: string; area?: string; country?: string } | undefined

        // Get photos from datingProfile or profile level
        const photos = datingProfile.photos || profile.photos

        // Get bio from datingProfile or profile level
        const bio = datingProfile.bio || profile.bio || ''

        // Get interests from datingProfile or profile level
        const interests = datingProfile.interests || profile.interests || []

        // Get dateOfBirth from datingProfile or profile level
        const dateOfBirth = datingProfile.dateOfBirth || profile.dateOfBirth

        return {
            id: profile.id,
            name: getDisplayName(profile),
            age: profile.age || calculateAge(dateOfBirth),
            distance: location?.city || undefined,
            area: location?.area || undefined,
            country: location?.country || undefined,
            bio: bio,
            photos: photos && photos.length > 0
                ? photos
                : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
            isVerified: profile.isVerified || false,
            isLiked: true, // All matches are liked
            isMatched: true, // All matches are matched
            tags: interests,
        }
    })

    const handleLike = async (profileId: string) => {
        try {
            const isCurrentlyLiked = likedProfiles.has(profileId)

            if (isCurrentlyLiked) {
                // Unlike the profile
                await ButicalAPI.datingProfiles.unlike(profileId)
                // Optimistically update UI
                setLikedProfiles(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(profileId)
                    return newSet
                })
                // Refetch likes from API to sync state
                await refetchLikes()
            } else {
                // Like the profile
                const response = await ButicalAPI.datingProfiles.like(profileId)
                // Optimistically update UI
                setLikedProfiles(prev => {
                    const newSet = new Set(prev)
                    newSet.add(profileId)
                    return newSet
                })

                // Check if it's a match from the API response
                const responseData = (response.data as any)?.data || response.data
                const matched = responseData?.matched || false

                if (matched) {
                    // It's a match! Show match notification
                    const profile = profiles.find(p => p.id === profileId)
                    if (profile) {
                        const match: MatchNotification = {
                            id: Date.now().toString(),
                            matchedUser: {
                                id: profile.id,
                                name: profile.name,
                                age: profile.age,
                                avatar: profile.photos[0],
                                bio: profile.bio || ''
                            },
                            matchedAt: new Date(),
                            isNew: true
                        }
                        setNewMatch(match)
                        setShowMatchModal(true)
                    }
                    // Refetch matches when a new match is created
                    await refetchMatches()
                }

                // Refetch likes from API to sync state
                await refetchLikes()
            }
        } catch (error: any) {
            console.error('Failed to like/unlike profile:', error)
            // Optionally show error to user
        }
    }

    const handleMessage = (profileId: string) => {
        // Find the profile from all available profiles to get the user ID
        const profile = allMatches.find((p: DatingProfile) => p.id === profileId) ||
            filteredDatingProfiles.find((p: DatingProfile) => p.id === profileId)

        if (profile && profile.userId) {
            // Use user ID for chat, not profile ID
            window.location.href = `/chat/${profile.userId}`
        } else {
            console.error('Could not find user ID for profile:', profileId)
        }
    }

    const handleViewProfile = (profileId: string) => {
        window.location.href = `/dating/profile/${profileId}`
    }

    // Handle location change
    const handleLocationChange = (location: string) => {
        setSelectedLocation(location)
        setFilters(prev => ({ ...prev, location }))
    }

    // Apply filters
    const handleApplyFilters = () => {
        refetch()
        setIsFilterOpen(false)
    }

    // Use matchProfiles when in matches view, otherwise use all profiles
    const profilesToShow = activeView === 'matches' ? matchProfiles : profiles

    const filteredProfiles = profilesToShow.filter(profile => {
        const matchesSearch =
            profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
    })

    const matchCount = allMatches.length

    // Show subscription banner for users without access (but don't block the page)
    const SubscriptionBanner = () => {
        if (subscriptionLoading || hasDatingAccess) return null

        return (
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">Unlock Full Dating Features</h3>
                                <p className="text-pink-100 text-sm mb-3">
                                    Subscribe to dating to like profiles, send messages, and get matches!
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <Link
                                        href="/subscription/dating"
                                        className="px-4 py-2 bg-white text-pink-600 rounded-lg hover:bg-pink-50 font-medium transition-colors text-sm"
                                    >
                                        Subscribe Now
                                    </Link>
                                    <Link
                                        href="/"
                                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 font-medium transition-colors text-sm"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Subscription Banner */}
            <SubscriptionBanner />

            {/* Sticky Header */}
            <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    {/* Top row */}
                    <div className="flex justify-between items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Dating</h1>

                        <div className="flex items-center gap-2">
                            <Link href="/dating/activity" className="relative flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 text-sm font-medium transition-all">
                                <Heart className="w-4 h-4" />
                                <span className="hidden sm:inline">Activity</span>
                                {matchCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                        {matchCount > 9 ? '9+' : matchCount}
                                    </span>
                                )}
                            </Link>

                            <Link href="/chat" className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 text-sm font-medium transition-all">
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Messages</span>
                            </Link>

                            <motion.button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-all ${isFilterOpen ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-200 text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600'}`}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">Filter</span>
                            </motion.button>

                            <div className="relative">
                                <motion.button
                                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 text-sm font-medium transition-all"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <MapPin className="w-4 h-4 text-pink-500" />
                                    <span className="hidden sm:inline">{selectedLocation}</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </motion.button>

                                <AnimatePresence>
                                    {isLocationOpen && (
                                        <motion.div
                                            className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-30"
                                            initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {kenyanCounties.map((county) => (
                                                <button key={county} onClick={() => { handleLocationChange(county); setIsLocationOpen(false) }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedLocation === county ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {county}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* View toggle */}
                    <div className="mt-3 flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                        {(['all', 'matches'] as const).map((view) => (
                            <button key={view} onClick={() => setActiveView(view)}
                                className={`relative flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all capitalize ${activeView === view ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {view === 'matches' && matchCount > 0 ? `Matches (${matchCount})` : view === 'all' ? 'All Profiles' : 'Matches'}
                                {view === 'matches' && matchCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">{matchCount > 9 ? '9+' : matchCount}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="mt-3 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, interests, or bio..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-pink-400 outline-none transition-colors bg-gray-50 focus:bg-white"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Filter Panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        className="bg-white border-b border-gray-100 shadow-sm"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="max-w-7xl mx-auto px-4 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
                                    <select className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:border-pink-400 outline-none transition-colors"
                                        onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value || undefined }))}>
                                        <option value="">Any</option>
                                        <option value="male">Men</option>
                                        <option value="female">Women</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Distance: {filters.maxDistance}km</label>
                                    <input type="range" min="1" max="100" value={filters.maxDistance}
                                        onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Age Range</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min="18" max="99" placeholder="Min" value={filters.minAge || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-pink-400 outline-none transition-colors" />
                                        <span className="text-gray-400 text-sm">–</span>
                                        <input type="number" min="18" max="99" placeholder="Max" value={filters.maxAge || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value ? parseInt(e.target.value) : undefined }))}
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-pink-400 outline-none transition-colors" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsFilterOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={handleApplyFilters} className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition-colors shadow-md shadow-pink-500/25">Apply Filters</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {error && !error.toLowerCase().includes('subscription') && !error.toLowerCase().includes('subscribe') && (
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                            <p className="text-red-700 font-medium text-sm">Failed to load profiles</p>
                            <p className="text-red-500 text-xs">{error}</p>
                        </div>
                        <button onClick={() => refetch()} className="ml-auto px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">Retry</button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="p-4 max-w-7xl mx-auto">
                <CompactReferralBanner />

                {(isLoading || (activeView === 'matches' && matchesLoading)) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                                <div className="shimmer aspect-[3/4] bg-gray-200" />
                                <div className="p-3 space-y-2">
                                    <div className="shimmer h-4 rounded-lg bg-gray-200 w-3/4" />
                                    <div className="shimmer h-3 rounded-lg bg-gray-200 w-1/2" />
                                    <div className="shimmer h-8 rounded-xl bg-gray-200 w-full mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProfiles.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                    >
                        {filteredProfiles.map(profile => (
                            <DatingCard key={profile.id} profile={profile} onLike={handleLike} onMessage={handleMessage} onView={handleViewProfile} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-pink-300" />
                        </div>
                        <p className="text-gray-700 font-semibold text-lg">
                            {!hasDatingAccess ? 'Subscribe to view dating profiles' : activeView === 'matches' ? 'No matches yet' : 'No profiles found'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                            {!hasDatingAccess ? 'Get access to our dating community and start making connections' : activeView === 'matches' ? 'Start liking profiles to get matches' : 'Try adjusting your search or filters'}
                        </p>
                        {!hasDatingAccess && (
                            <Link href="/subscription/dating" className="inline-block mt-4 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 transition-all">
                                Subscribe Now
                            </Link>
                        )}
                    </motion.div>
                )}
            </main>

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
                        window.location.href = `/chat/${newMatch.matchedUser.id}`
                    }}
                />
            )}

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                matchCount={matchCount}
                messageCount={unreadMessageCount}
            />
        </div>
    )
}

export default function DatingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <DatingPageContent />
        </Suspense>
    )
}
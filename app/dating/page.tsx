// app/dating/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, MapPin, Gift, MessageCircle, AlertCircle, Lock } from 'lucide-react'
import { DatingCard } from '../components/cards/DatingCard'
import { MatchNotificationModal } from '../components/common/MatchNotificationModal'
import MobileBottomNav from '../components/layout/MobileBottomNav'
import type { ProfileData } from '../components/cards/EscortCard'
import type { MatchNotification } from '../components/types/chat'
import { useDatingProfiles, useSubscription, useAuth } from '@/lib/hooks/butical-api-hooks'
import type { DatingProfile } from '@/services/butical-api-service'
import { TokenService } from '@/services/butical-api-service'

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
    <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-3 rounded-lg flex justify-between items-center mb-4">
        <div className="flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Earn money for each friend you refer and also from every person your referee refers!</span>
        </div>
        <Link
            href="/referral"
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
        >
            Learn More
        </Link>
    </div>
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

    // Safe profiles array
    const safeDatingProfiles = Array.isArray(apiProfiles) ? apiProfiles : []

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

    // Transform API data to ProfileData format
    const profiles: ProfileData[] = safeDatingProfiles.map((profile: DatingProfile) => ({
        id: profile.id,
        name: getDisplayName(profile),
        age: profile.age || calculateAge(profile.dateOfBirth),
        distance: 0, // You might want to calculate this on the backend
        bio: profile.bio || '',
        photos: profile.photos && profile.photos.length > 0
            ? profile.photos
            : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
        isVerified: profile.isVerified || false,
        isLiked: likedProfiles.has(profile.id),
        tags: profile.interests || [],
    }))

    const handleLike = (profileId: string) => {
        setLikedProfiles(prev => {
            const newSet = new Set(prev)
            if (newSet.has(profileId)) {
                newSet.delete(profileId)
            } else {
                newSet.add(profileId)

                // Simulate match notification (30% chance)
                const profile = profiles.find(p => p.id === profileId)
                if (profile && Math.random() > 0.7) {
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
            }
            return newSet
        })
    }

    const handleMessage = (profileId: string) => {
        window.location.href = `/chat/${profileId}`
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

    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch =
            profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesView = activeView === 'all' || (activeView === 'matches' && profile.isLiked)

        return matchesSearch && matchesView
    })

    const matchCount = likedProfiles.size

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

            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dating</h1>

                        <div className="flex gap-2">
                            <Link
                                href="/chat"
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2 relative"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden md:inline">Messages</span>
                                {matchCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {matchCount}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden md:inline">Filter</span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span className="hidden md:inline">{selectedLocation}</span>
                                </button>

                                {isLocationOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-20">
                                        {kenyanCounties.map((county) => (
                                            <button
                                                key={county}
                                                onClick={() => {
                                                    handleLocationChange(county)
                                                    setIsLocationOpen(false)
                                                }}
                                                className={`w-full text-left px-4 py-2 hover:bg-pink-50 transition-colors ${
                                                    selectedLocation === county ? 'bg-pink-100 text-pink-700 font-medium' : 'text-gray-700'
                                                }`}
                                            >
                                                {county}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => setActiveView('all')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeView === 'all'
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveView('matches')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors relative ${activeView === 'matches'
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Matches {matchCount > 0 && `(${matchCount})`}
                            {matchCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {matchCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="mt-3 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, interests, or bio"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </header>

            {/* Filter Panel */}
            {isFilterOpen && (
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="max-w-7xl mx-auto space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        gender: e.target.value || undefined
                                    }))}
                                >
                                    <option value="">Any</option>
                                    <option value="male">Men</option>
                                    <option value="female">Women</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Distance (km): {filters.maxDistance}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={filters.maxDistance}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        maxDistance: parseInt(e.target.value)
                                    }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1 km</span>
                                    <span>50 km</span>
                                    <span>100 km</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Age Range
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="18"
                                        max="99"
                                        placeholder="Min"
                                        value={filters.minAge || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            minAge: e.target.value ? parseInt(e.target.value) : undefined
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="number"
                                        min="18"
                                        max="99"
                                        placeholder="Max"
                                        value={filters.maxAge || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            maxAge: e.target.value ? parseInt(e.target.value) : undefined
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message - Only show if it's NOT a subscription error */}
            {error && !error.toLowerCase().includes('subscription') && !error.toLowerCase().includes('subscribe') && (
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                            <p className="text-red-800 font-medium">Failed to load profiles</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="p-4 max-w-7xl mx-auto">
                <CompactReferralBanner />

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="w-full">
                                <div className="animate-pulse">
                                    <div className="bg-gray-300 aspect-[3/4] rounded-xl mb-2"></div>
                                    <div className="bg-gray-300 h-4 rounded-md w-3/4 mb-2"></div>
                                    <div className="bg-gray-300 h-3 rounded-md w-1/2 mb-4"></div>
                                    <div className="flex gap-2">
                                        <div className="bg-gray-300 h-8 rounded-md w-1/2"></div>
                                        <div className="bg-gray-300 h-8 rounded-md w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProfiles.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProfiles.map(profile => (
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
                        <div className="text-gray-500 text-lg mb-2">
                            {!hasDatingAccess
                                ? 'Subscribe to view dating profiles'
                                : activeView === 'matches' ? 'No matches yet' : 'No profiles found'}
                        </div>
                        <p className="text-gray-600">
                            {!hasDatingAccess
                                ? 'Get access to our dating community and start making connections'
                                : activeView === 'matches'
                                    ? 'Start liking profiles to see your matches here'
                                    : 'Try adjusting your search or filters'}
                        </p>
                    </div>
                )}
            </main>

            {showMatchModal && newMatch && (
                <MatchNotificationModal
                    match={newMatch}
                    onClose={() => setShowMatchModal(false)}
                    onSendMessage={() => {
                        setShowMatchModal(false)
                        window.location.href = `/chat/${newMatch.matchedUser.id}`
                    }}
                />
            )}

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                matchCount={matchCount}
                messageCount={0}
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
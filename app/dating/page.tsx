// app/dating/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, Gift, MessageCircle } from 'lucide-react'
import { DatingCard } from '../components/cards/DatingCard'
import { MatchNotificationModal } from '../components/common/MatchNotificationModal'
import type { ProfileData } from '../components/cards/EscortCard'
import type { MatchNotification } from '../components/types/chat'

// Mock data for demonstration
const MOCK_PROFILES: ProfileData[] = [
    {
        id: '1',
        name: 'Jessica',
        age: 28,
        distance: 2,
        bio: 'Avid traveler, book lover, and coffee enthusiast. Looking for someone to share adventures with.',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
        isVerified: true,
        isLiked: false,
        tags: ['Travel', 'Reading', 'Photography']
    },
    {
        id: '2',
        name: 'Michael',
        age: 32,
        distance: 5,
        bio: 'Fitness instructor and foodie. Enjoys hiking and exploring new restaurants.',
        photos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80'],
        isVerified: true,
        isLiked: true,
        tags: ['Fitness', 'Food', 'Hiking']
    },
    {
        id: '3',
        name: 'Sophia',
        age: 25,
        distance: 7,
        bio: 'Med student by day, musician by night. Looking for someone to share laughs with.',
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80'],
        isVerified: false,
        isLiked: false,
        tags: ['Music', 'Medicine', 'Art']
    },
    {
        id: '4',
        name: 'David',
        age: 29,
        distance: 10,
        bio: 'Software engineer who loves hiking, photography, and trying new craft beers.',
        photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80'],
        isVerified: true,
        isLiked: false,
        tags: ['Tech', 'Hiking', 'Photography']
    },
    {
        id: '5',
        name: 'Emily',
        age: 27,
        distance: 15,
        bio: 'Marketing professional with a passion for yoga and travel. Looking for genuine connections.',
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80'],
        isVerified: true,
        isLiked: false,
        tags: ['Marketing', 'Yoga', 'Travel']
    },
    {
        id: '6',
        name: 'James',
        age: 31,
        distance: 8,
        bio: 'Chef and dog lover. Enjoys outdoor activities and cooking for friends.',
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
        isVerified: false,
        isLiked: true,
        tags: ['Cooking', 'Dogs', 'Outdoors']
    }
]

const CompactReferralBanner = () => (
    <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-3 rounded-lg flex justify-between items-center mb-4">
        <div className="flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Earn KSh 250 for each friend you refer!</span>
        </div>
        <Link
            href="/referral"
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
        >
            Learn More
        </Link>
    </div>
)

export default function DatingPage() {
    const [profiles, setProfiles] = useState<ProfileData[]>([])
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [activeView, setActiveView] = useState<'all' | 'matches'>('all')
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [newMatch, setNewMatch] = useState<MatchNotification | null>(null)

    useEffect(() => {
        const fetchProfiles = async () => {
            setIsLoading(true)
            setTimeout(() => {
                setProfiles(MOCK_PROFILES)
                setIsLoading(false)
            }, 800)
        }

        fetchProfiles()
    }, [])

    const handleLike = (profileId: string) => {
        setProfiles(prevProfiles =>
            prevProfiles.map(profile =>
                profile.id === profileId
                    ? { ...profile, isLiked: !profile.isLiked }
                    : profile
            )
        )

        const profile = profiles.find(p => p.id === profileId)
        if (profile && !profile.isLiked && Math.random() > 0.7) {
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

    const handleMessage = (profileId: string) => {
        window.location.href = `/chat/${profileId}`
    }

    // Handle view profile - navigate to public dating profile view
    const handleViewProfile = (profileId: string) => {
        window.location.href = `/dating/profile/${profileId}`
    }

    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch =
            profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesView = activeView === 'all' || (activeView === 'matches' && profile.isLiked)

        return matchesSearch && matchesView
    })

    const matchCount = profiles.filter(p => p.isLiked).length

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-[72px] md:top-[100px] z-10 bg-white border-b border-gray-200 p-4">
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

                            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="hidden md:inline">Nairobi</span>
                            </button>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Distance (km)
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    defaultValue="50"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="number"
                                        min="18"
                                        max="99"
                                        placeholder="Max"
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
                                onClick={() => setIsFilterOpen(false)}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
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
                            {activeView === 'matches' ? 'No matches yet' : 'No profiles found'}
                        </div>
                        <p className="text-gray-600">
                            {activeView === 'matches'
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
        </div>
    )
}
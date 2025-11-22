// app/hookups/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, X, Loader2 } from 'lucide-react'
import { EscortCard } from '../components/cards/EscortCard'
import type { ProfileData } from '../components/cards/EscortCard'

// Mock data for demonstration
const MOCK_PROFILES: ProfileData[] = [
    {
        id: 'e1',
        name: 'Sophia',
        age: 25,
        distance: 3,
        bio: 'Professional model with years of experience in entertainment industry.',
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'],
        rating: 4.8,
        price: 300,
        isUnlocked: false,
        isVip: true,
        hasDirectCall: false,
    },
    {
        id: 'e2',
        name: 'Olivia',
        age: 27,
        distance: 5,
        bio: 'Dancer and entertainer. Available for private bookings and special events.',
        photos: ['https://images.unsplash.com/photo-1614023342667-9f59d05c29f0?w=800&q=80'],
        rating: 4.5,
        price: 300,
        isUnlocked: true,
        isVip: false,
        hasDirectCall: true,
    },
    {
        id: 'e3',
        name: 'Isabella',
        age: 24,
        distance: 7,
        bio: 'Available for bookings. Discreet and professional service guaranteed.',
        photos: ['https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=800&q=80'],
        rating: 4.2,
        price: 300,
        isUnlocked: false,
        isVip: false,
        hasDirectCall: false, // LOCKED - Will show "Unlock Escort"
    },
    {
        id: 'e4',
        name: 'Emma',
        age: 26,
        distance: 10,
        bio: 'Experienced entertainer available for private bookings and companionship.',
        photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'],
        rating: 4.9,
        price: 300,
        isUnlocked: false,
        isVip: false,
        hasDirectCall: false, // LOCKED - Will show "Unlock Escort"
    },
    {
        id: 'e5',
        name: 'Ava',
        age: 29,
        distance: 15,
        bio: 'Professional actress and entertainer. Available for select bookings only.',
        photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80'],
        rating: 4.7,
        price: 300,
        isUnlocked: false,
        isVip: true,
        hasDirectCall: false,
    },
    {
        id: 'e6',
        name: 'Mia',
        age: 23,
        distance: 8,
        bio: 'New to the platform. Professional and friendly service available today.',
        photos: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80'],
        rating: 4.3,
        price: 300,
        isUnlocked: true,
        isVip: false,
        hasDirectCall: true,
    },
    {
        id: 'e7',
        name: 'Charlotte',
        age: 28,
        distance: 12,
        bio: 'Elegant companion available for dinner dates and special occasions.',
        photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'],
        rating: 4.6,
        price: 300,
        isUnlocked: false,
        isVip: false,
        hasDirectCall: false, // LOCKED - Will show "Unlock Escort"
    },
    {
        id: 'e8',
        name: 'Amelia',
        age: 26,
        distance: 9,
        bio: 'Friendly and professional service. Available for bookings now.',
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80'],
        rating: 4.4,
        price: 300,
        isUnlocked: false,
        isVip: false,
        hasDirectCall: false, // LOCKED - Will show "Unlock Escort"
    },
]

export default function HookupPage() {
    const [profiles, setProfiles] = useState<ProfileData[]>([])
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
    const [showAllTowns, setShowAllTowns] = useState(false)
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)

    const allTowns = [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
        'Kiambu', 'Nyeri Town', 'Naivasha', 'Meru Town', 'Nanyuki',
        'Embu Town', 'Kisii Town', 'Machakos Town', 'Narok town',
        'Isiolo Town', 'Voi', 'Kitui Town', 'Limuru', 'Nyahururu',
        'Kakamega Town', 'Kilifi Town', 'Wangige', 'Bungoma Town',
        'Bomet', 'Watamu', 'Chuka', 'Migori Town', 'Kitale', 'Mwea',
        'Kericho Town', 'Bondo', 'Malindi', 'Isinya', 'Lari'
    ]

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

    // Handle unlock action - triggers payment modal
    const handleUnlock = (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId)

        if (profile && !profile.isUnlocked && !profile.isVip) {
            setSelectedProfileId(profileId)
            setShowPaymentModal(true)
        }
    }

    // Handle view contact/profile - navigates to escort detail page
    const handleCall = (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId)
        if (profile) {
            // Navigate to escort detail page
            window.location.href = `/escorts/${profileId}`
        }
    }

    // Handle M-Pesa payment
    const handlePayment = async () => {
        if (!mpesaPhone.trim()) {
            alert('Please enter your M-Pesa phone number')
            return
        }

        setIsProcessingPayment(true)

        // Simulate M-Pesa STK push
        setTimeout(() => {
            // Simulate payment success
            if (selectedProfileId) {
                setProfiles(prevProfiles =>
                    prevProfiles.map(profile =>
                        profile.id === selectedProfileId
                            ? { ...profile, isUnlocked: true }
                            : profile
                    )
                )
            }

            setIsProcessingPayment(false)
            setShowPaymentModal(false)
            setSelectedProfileId(null)
            setMpesaPhone('')

            // Show success message
            alert('Payment successful! Contact unlocked.')
        }, 3000)
    }

    const filteredProfiles = profiles.filter(profile =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="sticky top-[72px] md:top-[100px] z-10 bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Browse Escorts</h1>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="px-3 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden md:inline">Filter</span>
                            </button>

                            <button className="px-3 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="hidden md:inline">Nairobi</span>
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search escorts by name or location"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>

                    {/* Escorts from other towns */}
                    <div className="mt-4">
                        <h2 className="text-sm font-semibold text-gray-300 mb-3">Escorts from other towns</h2>
                        <div className="flex flex-wrap gap-2">
                            {(showAllTowns ? allTowns : allTowns.slice(0, 6)).map(town => (
                                <button
                                    key={town}
                                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    {town}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowAllTowns(!showAllTowns)}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors"
                            >
                                {showAllTowns ? 'Show Less' : `View All (${allTowns.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Panel */}
            {isFilterOpen && (
                <div className="bg-gray-800 border-b border-gray-700 p-4">
                    <div className="max-w-7xl mx-auto space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Rating
                                </label>
                                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                                    <option value="">Any rating</option>
                                    <option value="4.5">4.5+ stars</option>
                                    <option value="4">4+ stars</option>
                                    <option value="3.5">3.5+ stars</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Distance (km)
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    defaultValue="50"
                                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>1 km</span>
                                    <span>50 km</span>
                                    <span>100 km</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Price Range
                                </label>
                                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                                    <option value="">Any price</option>
                                    <option value="300">KSh 300</option>
                                    <option value="500">KSh 500</option>
                                    <option value="custom">Custom range</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="px-4 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 font-medium transition-colors"
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
                <div className="flex gap-6">
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-[280px] space-y-4">
                            {/* Premium Ad Banner */}
                            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-6 text-white">
                                <h3 className="text-xl font-bold mb-2">Go Premium</h3>
                                <p className="text-sm mb-4 text-white/90">
                                    Unlock unlimited access to all profiles
                                </p>
                                <Link href="/auth/signup/dating">
                                    <button className="w-full bg-white text-rose-600 font-semibold py-2 rounded-lg hover:bg-rose-50 transition-colors">
                                        Upgrade Now
                                    </button>
                                </Link>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <h4 className="font-semibold text-white mb-3">Quick Stats</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Active Escorts</span>
                                        <span className="font-semibold text-white">1,247</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Online Now</span>
                                        <span className="font-semibold text-green-400">342</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">New Today</span>
                                        <span className="font-semibold text-white">28</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Profiles Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="w-full">
                                        <div className="animate-pulse">
                                            <div className="bg-gray-700 aspect-[3/4] rounded-xl mb-2"></div>
                                            <div className="bg-gray-700 h-4 rounded-md w-3/4 mb-2"></div>
                                            <div className="bg-gray-700 h-3 rounded-md w-1/2 mb-4"></div>
                                            <div className="bg-gray-700 h-8 rounded-md w-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProfiles.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProfiles.map(profile => (
                                    <EscortCard
                                        key={profile.id}
                                        profile={profile}
                                        onUnlock={handleUnlock}
                                        onCall={handleCall}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-lg mb-2">No escorts found</div>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* M-Pesa Payment Modal */}
            {showPaymentModal && selectedProfileId && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Unlock Escort</h2>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false)
                                    setMpesaPhone('')
                                    setSelectedProfileId(null)
                                }}
                                className="text-gray-400 hover:text-gray-200"
                                disabled={isProcessingPayment}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={profiles.find(p => p.id === selectedProfileId)?.photos[0]}
                                    alt={profiles.find(p => p.id === selectedProfileId)?.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div>
                                    <p className="text-white font-semibold">
                                        {profiles.find(p => p.id === selectedProfileId)?.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Age {profiles.find(p => p.id === selectedProfileId)?.age}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-pink-500/20 border border-pink-500/30 p-4 rounded-lg text-center mb-4">
                                <span className="text-white font-bold text-3xl">KSh 300</span>
                                <p className="text-sm text-gray-300 mt-1">One-time unlock fee</p>
                            </div>

                            <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-300 mb-2">
                                    ✓ View full contact information
                                </p>
                                <p className="text-sm text-gray-300 mb-2">
                                    ✓ Direct phone number access
                                </p>
                                <p className="text-sm text-gray-300">
                                    ✓ Permanent access to profile
                                </p>
                            </div>

                            <p className="text-sm text-gray-400 mb-4">
                                Enter your M-Pesa phone number. You'll receive a prompt to complete payment.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    M-Pesa Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={mpesaPhone}
                                    onChange={(e) => setMpesaPhone(e.target.value)}
                                    placeholder="+254 712 345 678"
                                    disabled={isProcessingPayment}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false)
                                    setMpesaPhone('')
                                    setSelectedProfileId(null)
                                }}
                                disabled={isProcessingPayment}
                                className="flex-1 px-4 py-3 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={isProcessingPayment || !mpesaPhone.trim()}
                                className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessingPayment ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Pay KSh 300</span>
                                )}
                            </button>
                        </div>

                        {isProcessingPayment && (
                            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-300 text-center">
                                    Check your phone for M-Pesa prompt...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
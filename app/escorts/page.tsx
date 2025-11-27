// app/hookups/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, X, Loader2, AlertCircle } from 'lucide-react'
import { EscortCard } from '../components/cards/EscortCard'
import type { ProfileData } from '../components/cards/EscortCard'
import { useEscorts, usePayment } from '@/lib/hooks/butical-api-hooks'
import type { Escort } from '@/services/butical-api-service'

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

export default function HookupPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isLocationOpen, setIsLocationOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [selectedLocation, setSelectedLocation] = useState('Nairobi')
    const [filters, setFilters] = useState({
        location: 'Nairobi',
        minRating: undefined as number | undefined,
        maxDistance: 50,
        minRate: undefined as number | undefined,
        maxRate: undefined as number | undefined,
    })

    // Fetch escorts using the hook
    const { escorts, loading: isLoading, error, refetch } = useEscorts({
        location: filters.location,
        page: 1,
        limit: 50,
    })

    // Payment hook
    const {
        unlockEscort,
        loading: isProcessingPayment,
        error: paymentError
    } = usePayment()

    // Safe escorts array
    const safeEscorts = Array.isArray(escorts) ? escorts : []

    // Helper to get display name from escort
    const getDisplayName = (escort: Escort): string => {
        if (escort.displayName) return escort.displayName;
        if (escort.user) return `${escort.user.firstName} ${escort.user.lastName}`.trim();
        return 'Anonymous';
    };

    // Helper to get location string
    const getLocation = (escort: Escort): string => {
        if (escort.location) return escort.location;
        if (escort.locations) {
            const parts = [escort.locations.area, escort.locations.city, escort.locations.country].filter(Boolean);
            return parts.join(', ') || 'Unknown location';
        }
        return 'Unknown location';
    };

    // Transform API data to ProfileData format
    const profiles: ProfileData[] = safeEscorts.map((escort: Escort) => ({
        id: escort.id,
        name: getDisplayName(escort),
        age: 0,
        distance: 0,
        bio: escort.about || '',
        photos: escort.photos && escort.photos.length > 0 ? escort.photos : ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'],
        rating: escort.rating || 4.5,
        price: escort.unlockPrice || escort.pricing?.unlockPrice || 150,
        isUnlocked: !escort.contactHidden,
        isVip: escort.vipStatus || escort.isVIP || false,
        hasDirectCall: !escort.contactHidden,
        services: escort.services || [],
    }))

    // Handle unlock action
    const handleUnlock = (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId)
        if (profile && !profile.isUnlocked && !profile.isVip) {
            setSelectedProfileId(profileId)
            setShowPaymentModal(true)
        }
    }

    // Handle view contact/profile
    const handleCall = (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId)
        if (profile) {
            window.location.href = `/escorts/${profileId}`
        }
    }

    // Handle M-Pesa payment
    const handlePayment = async () => {
        if (!mpesaPhone.trim()) {
            alert('Please enter your M-Pesa phone number')
            return
        }

        if (!selectedProfileId) {
            return
        }

        const result = await unlockEscort(selectedProfileId, mpesaPhone)

        if (result.success) {
            alert('Payment request sent! Please check your phone for M-Pesa prompt.')

            setTimeout(() => {
                setShowPaymentModal(false)
                setSelectedProfileId(null)
                setMpesaPhone('')
                refetch()
            }, 3000)
        } else {
            alert(result.error || 'Payment failed. Please try again.')
        }
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

    // Filter profiles based on search query
    const filteredProfiles = profiles.filter(profile =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 p-4">
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

                            <div className="relative">
                                <button
                                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                                    className="px-3 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span className="hidden md:inline">{selectedLocation}</span>
                                </button>

                                {isLocationOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto z-20">
                                        {kenyanCounties.map((county) => (
                                            <button
                                                key={county}
                                                onClick={() => {
                                                    handleLocationChange(county)
                                                    setIsLocationOpen(false)
                                                }}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                                                    selectedLocation === county ? 'bg-gray-700 text-pink-400 font-medium' : 'text-gray-200'
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

                    {/* Popular Counties Quick Access */}
                    <div className="mt-4">
                        <h2 className="text-sm font-semibold text-gray-300 mb-3">Popular Counties</h2>
                        <div className="flex flex-wrap gap-2">
                            {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Eldoret'].map(county => (
                                <button
                                    key={county}
                                    onClick={() => handleLocationChange(county)}
                                    className={`px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors ${selectedLocation === county
                                            ? 'bg-rose-600'
                                            : 'bg-rose-500 hover:bg-rose-600'
                                        }`}
                                >
                                    {county}
                                </button>
                            ))}
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
                                <select
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        minRating: e.target.value ? parseFloat(e.target.value) : undefined
                                    }))}
                                >
                                    <option value="">Any rating</option>
                                    <option value="4.5">4.5+ stars</option>
                                    <option value="4">4+ stars</option>
                                    <option value="3.5">3.5+ stars</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
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
                                <select
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (value === '300') {
                                            setFilters(prev => ({ ...prev, minRate: undefined, maxRate: 300 }))
                                        } else if (value === '500') {
                                            setFilters(prev => ({ ...prev, minRate: undefined, maxRate: 500 }))
                                        } else {
                                            setFilters(prev => ({ ...prev, minRate: undefined, maxRate: undefined }))
                                        }
                                    }}
                                >
                                    <option value="">Any price</option>
                                    <option value="300">Up to KSh 300</option>
                                    <option value="500">Up to KSh 500</option>
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
                                onClick={handleApplyFilters}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                            <p className="text-red-400 font-medium">Failed to load escorts</p>
                            <p className="text-red-300 text-sm">{error}</p>
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
                                        <span className="font-semibold text-white">{safeEscorts.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">In {selectedLocation}</span>
                                        <span className="font-semibold text-green-400">{filteredProfiles.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Verified</span>
                                        <span className="font-semibold text-white">
                                            {safeEscorts.filter((e: Escort) => e.verified || e.isVerified).length}
                                        </span>
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
                                <span className="text-white font-bold text-3xl">KSh 150</span>
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

                            {paymentError && (
                                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-red-300">{paymentError}</p>
                                </div>
                            )}

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
                                    placeholder="254712345678"
                                    disabled={isProcessingPayment}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
                                />
                                <p className="text-xs text-gray-400 mt-1">Format: 254XXXXXXXXX (no spaces or +)</p>
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
                                    <span>Pay KSh 150</span>
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
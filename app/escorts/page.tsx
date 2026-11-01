// app/escorts/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, X, AlertCircle } from 'lucide-react'
import { EscortCard, FREE_TIER_STYLE, TIER_STYLES, type EscortTier } from '../components/cards/EscortCard'
import type { ProfileData } from '../components/cards/EscortCard'
import { useEscorts } from '@/lib/hooks/butical-api-hooks'
import type { Escort } from '@/services/butical-api-service'
import ButicalAPI from '@/services/butical-api-service'
import { getPublicDisplayName } from '@/lib/utils/display-name'
import AdCarousel from '../components/ads/AdCarousel'

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
    const [selectedLocation, setSelectedLocation] = useState('Nairobi')
    const [popularLocations, setPopularLocations] = useState<{ city: string; count: number }[]>([])
    // Search runs on the server (all counties), a moment after typing stops
    const [debouncedQuery, setDebouncedQuery] = useState('')
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350)
        return () => clearTimeout(timer)
    }, [searchQuery])
    const isSearching = debouncedQuery.length > 0
    const [areas, setAreas] = useState<{ area: string; count: number }[]>([])
    const [filters, setFilters] = useState({
        location: 'Nairobi',
        area: '',
        minRating: undefined as number | undefined,
        maxDistance: 50,
        minRate: undefined as number | undefined,
        maxRate: undefined as number | undefined,
    })

    // Fetch popular locations on mount
    useEffect(() => {
        const fetchPopularLocations = async () => {
            try {
                const response = await ButicalAPI.escorts.getPopularLocations(10)
                const raw = response.data?.data || []
                // One entry per county even if older data differs by case
                const merged = new Map<string, { city: string; count: number }>()
                for (const loc of Array.isArray(raw) ? raw : []) {
                    const key = loc.city.trim().toLowerCase()
                    const prev = merged.get(key)
                    merged.set(key, prev ? { city: prev.city, count: prev.count + loc.count } : { city: loc.city.trim(), count: loc.count })
                }
                const locations = [...merged.values()].sort((a, b) => b.count - a.count)
                if (locations.length > 0) {
                    setPopularLocations(locations)
                    // Set initial location to the most popular one if available
                    if (locations[0]?.city) {
                        setSelectedLocation(locations[0].city)
                        setFilters(prev => ({ ...prev, location: locations[0].city }))
                    }
                }
            } catch (error) {
                console.error('Failed to fetch popular locations:', error)
            }
        }
        fetchPopularLocations()
    }, [])

    // Escorts are shuffled within each tier so everyone on a plan gets equal
    // exposure. The seed is fixed for the browsing session so the order stays
    // put while filtering or paging, but rotates on a fresh visit.
    const [shuffleSeed] = useState(() => Math.random().toString(36).slice(2))

    // Fetch escorts using the hook
    // Areas within the selected county, for the area dropdown
    useEffect(() => {
        let cancelled = false
        ButicalAPI.escorts
            .getAreas(filters.location)
            .then((res) => { if (!cancelled) setAreas(res.data?.data || []) })
            .catch(() => { if (!cancelled) setAreas([]) })
        return () => { cancelled = true }
    }, [filters.location])

    const { escorts, loading: isLoading, error, refetch } = useEscorts({
        // A search looks across every county; otherwise use county and area
        location: isSearching ? undefined : filters.location,
        area: isSearching ? undefined : (filters.area || undefined),
        q: isSearching ? debouncedQuery : undefined,
        seed: shuffleSeed,
        page: 1,
        limit: 50,
    })

    // Safe escorts array
    const safeEscorts = Array.isArray(escorts) ? escorts : []

    // Helper to get display name from escort
    const getDisplayName = (escort: Escort): string =>
        getPublicDisplayName(escort, escort.user);

    // Helper to get location string
    const getLocation = (escort: Escort): string => {
        if (escort.location) {
            if (typeof escort.location === 'string') return escort.location;
            // location is an EscortLocation object
            const loc = escort.location as { area?: string; city?: string; country?: string };
            const parts = [loc.area, loc.city, loc.country].filter(Boolean);
            return parts.join(', ') || 'Unknown location';
        }
        if (escort.locations) {
            const parts = [escort.locations.area, escort.locations.city, escort.locations.country].filter(Boolean);
            return parts.join(', ') || 'Unknown location';
        }
        return 'Unknown location';
    };

    // Helper to calculate age from date of birth
    const calculateAge = (dateOfBirth?: string): number => {
        if (!dateOfBirth) return 25; // Default age
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age > 0 ? age : 25;
    };

    // Transform API data to ProfileData format
    const profiles: ProfileData[] = safeEscorts.map((escort: Escort) => {
        // Handle location which can be string or object {city, area}
        let locationArea = '';
        let locationCity = 'Kenya';

        if (escort.location && typeof escort.location === 'object') {
            locationArea = escort.location.area || '';
            locationCity = escort.location.city || 'Kenya';
        } else if (typeof escort.location === 'string') {
            locationArea = escort.location;
        }

        // Also check escort.locations for backward compatibility
        if (!locationArea && escort.locations?.area) {
            locationArea = escort.locations.area;
        }
        if (locationCity === 'Kenya' && escort.locations?.city) {
            locationCity = escort.locations.city;
        }
        if (escort.city) {
            locationCity = escort.city;
        }

        return {
        id: escort.id,
        name: getDisplayName(escort),
        age: calculateAge(escort.dateOfBirth),
        location: locationArea,
        city: locationCity,
        ethnicity: escort.ethnicity,
        category: escort.category,
        bio: escort.about || '',
        photos: escort.photos && escort.photos.length > 0 ? escort.photos : ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'],
        photoCount: escort.photos?.length || 0,
        videoCount: escort.videos?.length || 0,
        isVerified: escort.isVerified || escort.verified || false,
        isVip: escort.vipStatus || escort.isVIP || false,
        tier: escort.tier ?? null,
        isNew: escort.isNew || false,
        rating: escort.rating || 4.5,
        // Contact details are free for every escort, free accounts included
        hasDirectCall: true,
        services: escort.services || [],
    };
    })

    // Handle view contact/profile
    const handleCall = (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId)
        if (profile) {
            window.location.href = `/escorts/${profileId}`
        }
    }

    // Handle location change
    const handleLocationChange = (location: string) => {
        setSelectedLocation(location)
        setSearchQuery('')
        // A new county has its own areas
        setFilters(prev => ({ ...prev, location, area: '' }))
    }

    // Apply filters
    const handleApplyFilters = () => {
        refetch()
        setIsFilterOpen(false)
    }

    // Search is done by the API; the list is already filtered
    const filteredProfiles = profiles

    // Sections by plan, top plans first. The API already orders by tier and
    // shuffles within each tier, so grouping keeps that order.
    const TIER_SECTIONS: (EscortTier | null)[] = ['VVIP', 'VIP', 'PRIME', 'REGULAR', null]
    const sections = TIER_SECTIONS
        .map((tier) => ({ tier, items: filteredProfiles.filter((p) => (p.tier ?? null) === tier) }))
        .filter((section) => section.items.length > 0)

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

                    {/* Search + area */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, county or area"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <select
                            aria-label="Area"
                            value={filters.area}
                            disabled={isSearching}
                            onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
                            className="sm:w-56 px-3 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
                        >
                            <option value="">All areas in {selectedLocation}</option>
                            {areas.map(({ area, count }) => (
                                <option key={area} value={area}>{area} ({count})</option>
                            ))}
                        </select>
                    </div>
                    {isSearching && (
                        <p className="mt-2 text-xs text-gray-400">Searching all counties for “{debouncedQuery}”</p>
                    )}

                    {/* Popular Counties Quick Access */}
                    <div className="mt-4">
                        <h2 className="text-sm font-semibold text-gray-300 mb-3">Popular Counties</h2>
                        <div className="flex flex-wrap gap-2">
                            {(popularLocations.length > 0
                                ? popularLocations.slice(0, 6).map(loc => loc.city)
                                : ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Eldoret']
                            ).map(county => (
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

            {/* Sponsored carousel, directly beneath the locations row */}
            <div className="max-w-7xl mx-auto px-4 pt-4">
                <AdCarousel />
            </div>

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
                                <h3 className="text-xl font-bold mb-2">Try LoveBite Dating</h3>
                                <p className="text-sm mb-4 text-white/90">
                                    Meet people near you looking for something real
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
                                        <span className="text-gray-400">{isSearching ? 'Search results' : `In ${filters.area || selectedLocation}`}</span>
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
                            <div className="space-y-8">
                                {sections.map(({ tier, items }) => (
                                    <section key={tier ?? 'none'}>
                                        <div className="flex items-center gap-3 mb-3">
                                            {tier ? (
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${TIER_STYLES[tier].badge}`}>
                                                    {TIER_STYLES[tier].label}
                                                </span>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${FREE_TIER_STYLE.badge}`}>
                                                    {FREE_TIER_STYLE.label}
                                                </span>
                                            )}
                                            <span className="text-sm text-gray-400">{items.length}</span>
                                            <div className="flex-1 h-px bg-gray-700" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {items.map(profile => (
                                                <EscortCard
                                                    key={profile.id}
                                                    profile={profile}
                                                    onCall={handleCall}
                                                />
                                            ))}
                                        </div>
                                    </section>
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

        </div>
    )
}
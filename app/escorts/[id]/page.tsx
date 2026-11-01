// app/escorts/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Globe,
    ArrowLeft, MapPin, Star, Clock, Phone, MessageCircle,
    Crown, Check, Share2, AlertCircle
} from 'lucide-react'
import { useEscort } from '@/lib/hooks/butical-api-hooks'
import { escortProfileUrl, shareLink } from '@/lib/utils/share'
import { getImageUrl, getImageUrls } from '@/lib/utils/image'
import { getPublicDisplayName } from '@/lib/utils/display-name'

export default function EscortViewPage() {
    const params = useParams()
    const router = useRouter()
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
    const [shareNote, setShareNote] = useState<string | null>(null)

    // Fetch escort data using the hook
    const { escort, loading: isLoading, error } = useEscort(params.id as string)


    // Helper to get display name from escort
    const getDisplayName = (e: typeof escort): string => {
        if (!e) return 'Unknown';
        return getPublicDisplayName(e, e.user);
    };

    // Helper to get location string
    const getLocation = (e: typeof escort): string => {
        if (!e) return 'Unknown location';

        // Handle location as object {city, area}
        if (e.location && typeof e.location === 'object') {
            const locObj = e.location as { city?: string; area?: string };
            const parts = [locObj.area, locObj.city].filter(Boolean);
            return parts.join(', ') || 'Unknown location';
        }

        // Handle location as string
        if (e.location && typeof e.location === 'string') {
            return e.location;
        }

        // Handle legacy locations field
        if (e.locations) {
            const parts = [e.locations.area, e.locations.city, e.locations.country].filter(Boolean);
            return parts.join(', ') || 'Unknown location';
        }

        return 'Unknown location';
    };

    // Check if escort is verified (handles both old and new field names)
    const isEscortVerified = escort?.verified || escort?.isVerified || false;
    const isEscortVip = escort?.vipStatus || escort?.isVIP || false;

    const handleShare = async () => {
        if (!escort) return
        const result = await shareLink({
            url: escortProfileUrl(escort.id),
            title: `${getDisplayName(escort)} on LoveBite`,
            text: `Check out ${getDisplayName(escort)} on LoveBite`,
        })
        if (result === 'copied') setShareNote('Profile link copied')
        else if (result === 'failed') setShareNote("Couldn't share. Copy the link from the address bar.")
        if (result === 'copied' || result === 'failed') setTimeout(() => setShareNote(null), 2500)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/hookups')}
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                    >
                        Back to Browse
                    </button>
                </div>
            </div>
        )
    }

    if (!escort) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
                    <p className="text-gray-400 mb-6">This escort profile doesn't exist or has been removed.</p>
                    <button
                        onClick={() => router.push('/hookups')}
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                    >
                        Back to Browse
                    </button>
                </div>
            </div>
        )
    }

    // Safe photo array with proper image URL handling
    const photos = getImageUrls(escort.photos)

    // Contact details are shown to everyone, on every plan and free accounts
    const contactPhone = escort.contactPhone

    // Get display values
    const displayName = getDisplayName(escort)
    const locationStr = getLocation(escort)
    const hourlyRate = escort.pricing?.hourlyRate || escort.hourlyRate || 300

    // Profile details saved at signup / in the escort profile editor
    const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const availability = (escort.availability ?? {}) as { days?: string[]; hours?: string }
    const workingDays = Array.isArray(availability.days) ? availability.days : []
    const workingHours = typeof availability.hours === 'string' ? availability.hours : ''
    const services: string[] = (Array.isArray(escort.services) ? escort.services : [])
        .map((s: any) => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean)
    const languages: string[] = Array.isArray((escort as any).languages) ? (escort as any).languages : []

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-300 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Back</span>
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={handleShare}
                                aria-label="Share this profile"
                                className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                <span className="hidden sm:inline text-sm font-medium">Share</span>
                            </button>
                            {shareNote && (
                                <span role="status" className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg bg-gray-700 px-3 py-1.5 text-xs text-white shadow">
                                    {shareNote}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Photos & Gallery */}
                    <div className="lg:col-span-2">
                        {/* Main Photo */}
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-800 mb-4">
                            <img
                                src={photos[selectedPhotoIndex]}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                            {isEscortVerified && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-full">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Verified</span>
                                </div>
                            )}
                            {isEscortVip && (
                                <div className="absolute top-4 left-4 flex items-center gap-1 bg-yellow-500 text-black px-3 py-1.5 rounded-full">
                                    <Crown className="w-4 h-4" />
                                    <span className="text-sm font-semibold">VIP</span>
                                </div>
                            )}
                        </div>

                        {/* Photo Thumbnails */}
                        {photos.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
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
                                            src={photo}
                                            alt={`${displayName} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-gray-800 rounded-xl p-6 mt-6">
                            <h2 className="text-xl font-bold text-white mb-4">About Me</h2>
                            <p className="text-gray-300 leading-relaxed">
                                {escort.about || 'No description available.'}
                            </p>
                        </div>

                        {/* Location & Details */}
                        <div className="bg-gray-800 rounded-xl p-6 mt-4">
                            <h2 className="text-xl font-bold text-white mb-4">Details</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-pink-400" />
                                    <div>
                                        <p className="text-sm text-gray-400">Location</p>
                                        <p className="text-white font-medium">{locationStr}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-green-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-400">Working hours</p>
                                        <p className="text-white font-medium">{workingHours || 'Not set'}</p>
                                        {workingDays.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {ALL_DAYS.map((day) => (
                                                    <span
                                                        key={day}
                                                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${workingDays.includes(day) ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-gray-700 text-gray-500'}`}
                                                    >
                                                        {day.slice(0, 3)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {languages.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-400">Languages</p>
                                            <p className="text-white font-medium">{languages.join(', ')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="bg-gray-800 rounded-xl p-6 mt-4">
                            <h2 className="text-xl font-bold text-white mb-4">Services</h2>
                            {services.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {services.map((service) => (
                                        <span key={service} className="px-3 py-1.5 rounded-full text-sm bg-pink-500/15 text-pink-200 border border-pink-500/30">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">No services listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Info & Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                            {/* Name & Basic Info */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {displayName}
                                </h1>
                                <div className="flex items-center text-gray-300 mb-3">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{locationStr}</span>
                                </div>

                                {/* View Count */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-400 text-sm">
                                            {(escort as any).totalViews ?? escort.views ?? 0} views
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="mb-6 p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-300 mb-1">Hourly Rate</h3>
                                <p className="text-3xl font-bold text-white">
                                    KSh {hourlyRate.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">per hour</p>
                            </div>

                            {/* Contact Information */}
                            {contactPhone ? (
                                <>
                                    <div className="mb-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                        <div className="flex items-center gap-2 text-white">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-lg font-semibold">{contactPhone}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Call or message to book this escort
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <a
                                            href={`tel:${contactPhone}`}
                                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span>Call Now</span>
                                        </a>

                                        <a
                                            href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full px-4 py-3 border-2 border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span>WhatsApp Message</span>
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <div className="mb-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-center">
                                    <p className="text-gray-400 text-sm">This escort hasn&apos;t added a contact number yet.</p>
                                </div>
                            )}

                            {/* Safety Notice */}
                            <div className="mt-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                                <p className="text-xs text-yellow-300">
                                    ⚠️ Always meet in public places first. Stay safe and report any suspicious behavior.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
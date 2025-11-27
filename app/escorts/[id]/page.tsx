// app/escorts/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, MapPin, Star, Clock, Phone, MessageCircle,
    Crown, Check, X, Loader2, Share2, AlertCircle
} from 'lucide-react'
import { useEscort, usePayment } from '@/lib/hooks/butical-api-hooks'
import { getImageUrl, getImageUrls } from '@/lib/utils/image'

export default function EscortViewPage() {
    const params = useParams()
    const router = useRouter()
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isUnlocked, setIsUnlocked] = useState(false)

    // Fetch escort data using the hook
    const { escort, loading: isLoading, error } = useEscort(params.id as string)

    // Payment hook
    const {
        unlockEscort,
        loading: isProcessingPayment,
        error: paymentError
    } = usePayment()

    // Helper to get display name from escort
    const getDisplayName = (e: typeof escort): string => {
        if (!e) return 'Unknown';
        if (e.displayName) return e.displayName;
        if (e.user) return `${e.user.firstName} ${e.user.lastName}`.trim();
        return 'Anonymous';
    };

    // Helper to get location string
    const getLocation = (e: typeof escort): string => {
        if (!e) return 'Unknown location';
        if (e.location) return e.location;
        if (e.locations) {
            const parts = [e.locations.area, e.locations.city, e.locations.country].filter(Boolean);
            return parts.join(', ') || 'Unknown location';
        }
        return 'Unknown location';
    };

    // Check if escort is verified (handles both old and new field names)
    const isEscortVerified = escort?.verified || escort?.isVerified || false;
    const isEscortVip = escort?.vipStatus || escort?.isVIP || false;

    const handleUnlock = () => {
        if (!isUnlocked && escort && !isEscortVerified) {
            setShowPaymentModal(true)
        }
    }

    const handlePayment = async () => {
        if (!mpesaPhone.trim()) {
            alert('Please enter your M-Pesa phone number')
            return
        }

        if (!params.id) {
            return
        }

        const result = await unlockEscort(params.id as string, mpesaPhone)

        if (result.success) {
            setIsUnlocked(true)
            setShowPaymentModal(false)
            setMpesaPhone('')
            alert('Payment successful! Contact unlocked.')
        } else {
            alert(result.error || 'Payment failed. Please try again.')
        }
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

    // Check if contact should be unlocked (VIP profiles are always unlocked)
    const isContactUnlocked = isUnlocked || isEscortVerified || !escort.contactHidden

    // Get display values
    const displayName = getDisplayName(escort)
    const locationStr = getLocation(escort)
    const unlockPrice = escort.unlockPrice || escort.pricing?.unlockPrice || 150
    const hourlyRate = escort.pricing?.hourlyRate || escort.hourlyRate || 300

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

                        <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
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
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <p className="text-sm text-gray-400">Rating</p>
                                        <p className="text-white font-medium">4.5 / 5.0 (Based on profile quality)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="text-sm text-gray-400">Status</p>
                                        <p className="text-white font-medium">Available for booking</p>
                                    </div>
                                </div>
                            </div>
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
                                            {escort.views || 0} views
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
                            {isContactUnlocked ? (
                                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-400 mb-2">
                                        <Check className="w-5 h-5" />
                                        <span className="font-semibold">Contact Unlocked</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-lg font-semibold">
                                            {escort.contactPhone || 'Contact Available'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Call or message to book this escort
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-center">
                                    <p className="text-gray-400 text-sm mb-2">Contact information is locked</p>
                                    <p className="text-white font-semibold">Pay KSh {unlockPrice} to unlock</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {isContactUnlocked ? (
                                    <>
                                        <a
                                            href={`tel:${escort.contactPhone}`}
                                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span>Call Now</span>
                                        </a>

                                        <a
                                            href={`https://wa.me/${escort.contactPhone?.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full px-4 py-3 border-2 border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span>WhatsApp Message</span>
                                        </a>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleUnlock}
                                        className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold transition-colors"
                                    >
                                        Unlock Contact - KSh {unlockPrice}
                                    </button>
                                )}
                            </div>

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

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Unlock Contact</h2>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false)
                                    setMpesaPhone('')
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
                                    src={photos[0]}
                                    alt={displayName}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div>
                                    <p className="text-white font-semibold">{displayName}</p>
                                    <p className="text-sm text-gray-400">{locationStr}</p>
                                </div>
                            </div>

                            <div className="bg-pink-500/20 border border-pink-500/30 p-4 rounded-lg text-center mb-4">
                                <span className="text-white font-bold text-3xl">KSh {unlockPrice}</span>
                                <p className="text-sm text-gray-300 mt-1">One-time unlock fee</p>
                            </div>

                            <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-300 mb-2">✓ View phone number</p>
                                <p className="text-sm text-gray-300 mb-2">✓ Direct call & SMS access</p>
                                <p className="text-sm text-gray-300">✓ Permanent access</p>
                            </div>

                            {paymentError && (
                                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-red-300">{paymentError}</p>
                                </div>
                            )}

                            <p className="text-sm text-gray-400 mb-4">
                                Enter your M-Pesa phone number to complete payment.
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
                                }}
                                disabled={isProcessingPayment}
                                className="flex-1 px-4 py-3 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={isProcessingPayment || !mpesaPhone.trim()}
                                className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessingPayment ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Pay KSh {unlockPrice}</span>
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
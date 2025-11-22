// app/escorts/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, MapPin, Star, Clock, Phone, MessageCircle,
    Crown, Check, Languages, X, Loader2, Share2
} from 'lucide-react'

// Mock escort data
const MOCK_ESCORT_DATA: Record<string, any> = {
    'e1': {
        id: 'e1',
        name: 'Sophia',
        age: 25,
        location: 'Nairobi, Westlands',
        description: 'Professional model with years of experience in entertainment industry. I provide discreet, high-quality companionship services for discerning clients. Available for dinner dates, events, and private meetings.',
        photos: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
        ],
        rating: 4.8,
        reviews: 42,
        hourlyRate: 8000,
        isVip: true,
        isVerified: true,
        contactPhone: '+254 798 765 432',
        languages: ['English', 'Swahili', 'French'],
        services: [
            'Girlfriend Experience (GFE)',
            'Massage',
            'Dinner Date',
            'Travel Companion',
            'Overnight'
        ],
        availability: {
            monday: { available: true, from: '14:00', to: '23:00' },
            tuesday: { available: true, from: '14:00', to: '23:00' },
            wednesday: { available: true, from: '14:00', to: '23:00' },
            thursday: { available: true, from: '14:00', to: '23:00' },
            friday: { available: true, from: '12:00', to: '02:00' },
            saturday: { available: true, from: '12:00', to: '02:00' },
            sunday: { available: false, from: '', to: '' },
        }
    },
    'e2': {
        id: 'e2',
        name: 'Olivia',
        age: 27,
        location: 'Nairobi, Kilimani',
        description: 'Dancer and entertainer. Available for private bookings and special events. Known for my warm personality and professional approach.',
        photos: [
            'https://images.unsplash.com/photo-1614023342667-9f59d05c29f0?w=800&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
        ],
        rating: 4.5,
        reviews: 28,
        hourlyRate: 7000,
        isVip: false,
        isVerified: true,
        contactPhone: '+254 712 555 888',
        languages: ['English', 'Swahili'],
        services: [
            'Massage',
            'Dance Performance',
            'Dinner Date',
            'Role Play'
        ],
        availability: {
            monday: { available: true, from: '18:00', to: '23:00' },
            tuesday: { available: true, from: '18:00', to: '23:00' },
            wednesday: { available: false, from: '', to: '' },
            thursday: { available: true, from: '18:00', to: '23:00' },
            friday: { available: true, from: '16:00', to: '02:00' },
            saturday: { available: true, from: '16:00', to: '02:00' },
            sunday: { available: false, from: '', to: '' },
        }
    }
}

export default function EscortViewPage() {
    const params = useParams()
    const router = useRouter()
    const [escort, setEscort] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [isUnlocked, setIsUnlocked] = useState(false)

    useEffect(() => {
        const fetchEscort = async () => {
            setIsLoading(true)
            setTimeout(() => {
                const escortData = MOCK_ESCORT_DATA[params.id as string]
                if (escortData) {
                    setEscort(escortData)
                    // Check if VIP (VIP profiles are always unlocked)
                    setIsUnlocked(escortData.isVip)
                }
                setIsLoading(false)
            }, 600)
        }

        fetchEscort()
    }, [params.id])

    const handleUnlock = () => {
        if (!isUnlocked && !escort?.isVip) {
            setShowPaymentModal(true)
        }
    }

    const handlePayment = async () => {
        if (!mpesaPhone.trim()) {
            alert('Please enter your M-Pesa phone number')
            return
        }

        setIsProcessingPayment(true)

        setTimeout(() => {
            setIsUnlocked(true)
            setIsProcessingPayment(false)
            setShowPaymentModal(false)
            setMpesaPhone('')
            alert('Payment successful! Contact unlocked.')
        }, 3000)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
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
                                src={escort.photos[selectedPhotoIndex]}
                                alt={escort.name}
                                className="w-full h-full object-cover"
                            />
                            {escort.isVip && (
                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full">
                                    <Crown className="w-4 h-4" />
                                    <span className="text-sm font-semibold">VIP</span>
                                </div>
                            )}
                            {escort.isVerified && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-full">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Verified</span>
                                </div>
                            )}
                        </div>

                        {/* Photo Thumbnails */}
                        <div className="grid grid-cols-4 gap-2">
                            {escort.photos.map((photo: string, index: number) => (
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
                                        alt={`${escort.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="bg-gray-800 rounded-xl p-6 mt-6">
                            <h2 className="text-xl font-bold text-white mb-4">About Me</h2>
                            <p className="text-gray-300 leading-relaxed">{escort.description}</p>
                        </div>

                        {/* Services */}
                        <div className="bg-gray-800 rounded-xl p-6 mt-4">
                            <h2 className="text-xl font-bold text-white mb-4">Services Offered</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {escort.services.map((service: string) => (
                                    <div
                                        key={service}
                                        className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm"
                                    >
                                        {service}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability Schedule */}
                        <div className="bg-gray-800 rounded-xl p-6 mt-4">
                            <h2 className="text-xl font-bold text-white mb-4">Availability</h2>
                            <div className="space-y-2">
                                {Object.entries(escort.availability).map(([day, schedule]: [string, any]) => (
                                    <div key={day} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-white font-medium capitalize">{day}</span>
                                        {schedule.available ? (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm">{schedule.from} - {schedule.to}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">Not available</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Info & Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                            {/* Name & Basic Info */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {escort.name}, {escort.age}
                                </h1>
                                <div className="flex items-center text-gray-300 mb-3">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{escort.location}</span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                        <span className="text-white font-semibold">{escort.rating}</span>
                                        <span className="text-gray-400 text-sm">({escort.reviews} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Languages</h3>
                                <div className="flex flex-wrap gap-2">
                                    {escort.languages.map((language: string) => (
                                        <div
                                            key={language}
                                            className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                                        >
                                            <Languages className="w-3 h-3" />
                                            {language}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="mb-6 p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-300 mb-1">Hourly Rate</h3>
                                <p className="text-3xl font-bold text-white">
                                    KSh {escort.hourlyRate.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">per hour</p>
                            </div>

                            {/* Contact Information */}
                            {isUnlocked || escort.isVip ? (
                                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-400 mb-2">
                                        <Check className="w-5 h-5" />
                                        <span className="font-semibold">Contact Unlocked</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Phone className="w-4 h-4" />
                                        <a href={`tel:${escort.contactPhone}`} className="text-lg font-semibold hover:text-pink-400">
                                            {escort.contactPhone}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-center">
                                    <p className="text-gray-400 text-sm mb-2">Contact information is locked</p>
                                    <p className="text-white font-semibold">Pay KSh 300 to unlock</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {isUnlocked || escort.isVip ? (
                                    <>
                                        <a
                                            href={`tel:${escort.contactPhone}`}
                                            className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span>Call Now</span>
                                        </a>

                                        <a
                                            href={`sms:${escort.contactPhone}`}
                                            className="w-full px-4 py-3 border-2 border-pink-500 text-pink-400 rounded-lg hover:bg-pink-500/10 font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span>Send Message</span>
                                        </a>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleUnlock}
                                        className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold transition-colors"
                                    >
                                        Unlock Contact - KSh 300
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
                                    src={escort.photos[0]}
                                    alt={escort.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div>
                                    <p className="text-white font-semibold">{escort.name}</p>
                                    <p className="text-sm text-gray-400">Age {escort.age}</p>
                                </div>
                            </div>

                            <div className="bg-pink-500/20 border border-pink-500/30 p-4 rounded-lg text-center mb-4">
                                <span className="text-white font-bold text-3xl">KSh 300</span>
                                <p className="text-sm text-gray-300 mt-1">One-time unlock fee</p>
                            </div>

                            <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-300 mb-2">✓ View phone number</p>
                                <p className="text-sm text-gray-300 mb-2">✓ Direct call & SMS access</p>
                                <p className="text-sm text-gray-300">✓ Permanent access</p>
                            </div>

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
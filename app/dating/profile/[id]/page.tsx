// app/dating/profile/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, MapPin, Heart, MessageCircle, Check, Briefcase,
    GraduationCap, Share2, X
} from 'lucide-react'

// Mock dating user data
const MOCK_DATING_DATA: Record<string, any> = {
    '1': {
        id: '1',
        name: 'Jessica',
        displayName: 'Jess',
        age: 28,
        location: 'Nairobi, Kenya',
        distance: 2,
        bio: 'Avid traveler, book lover, and coffee enthusiast. Looking for someone to share adventures with. I believe in living life to the fullest and making meaningful connections. Love spontaneous road trips and deep conversations over good coffee.',
        photos: [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
            'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80',
        ],
        interests: ['Travel', 'Reading', 'Photography', 'Hiking', 'Coffee', 'Food'],
        education: "Bachelor's in Business Administration",
        occupation: 'Marketing Manager',
        isVerified: true,
        isLiked: false,
        gender: 'Female',
        lookingFor: 'Men'
    },
    '2': {
        id: '2',
        name: 'Michael',
        displayName: 'Mike',
        age: 32,
        location: 'Nairobi, Kenya',
        distance: 5,
        bio: 'Fitness instructor and foodie. Enjoys hiking and exploring new restaurants. Always up for an adventure and trying new things.',
        photos: [
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
        ],
        interests: ['Fitness', 'Food', 'Hiking', 'Travel', 'Music'],
        education: "Diploma in Sports Science",
        occupation: 'Fitness Instructor',
        isVerified: true,
        isLiked: true,
        gender: 'Male',
        lookingFor: 'Women'
    },
    '3': {
        id: '3',
        name: 'Sophia',
        displayName: 'Sophie',
        age: 25,
        location: 'Nairobi, Kenya',
        distance: 7,
        bio: 'Med student by day, musician by night. Looking for someone to share laughs with.',
        photos: [
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
        ],
        interests: ['Music', 'Medicine', 'Art'],
        education: "Medical School",
        occupation: 'Medical Student',
        isVerified: false,
        isLiked: false,
        gender: 'Female',
        lookingFor: 'Men'
    },
    '4': {
        id: '4',
        name: 'David',
        displayName: 'Dave',
        age: 29,
        location: 'Nairobi, Kenya',
        distance: 10,
        bio: 'Software engineer who loves hiking, photography, and trying new craft beers.',
        photos: [
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
        ],
        interests: ['Tech', 'Hiking', 'Photography'],
        education: "Computer Science Degree",
        occupation: 'Software Engineer',
        isVerified: true,
        isLiked: false,
        gender: 'Male',
        lookingFor: 'Women'
    },
    '5': {
        id: '5',
        name: 'Emily',
        displayName: 'Em',
        age: 27,
        location: 'Nairobi, Kenya',
        distance: 15,
        bio: 'Marketing professional with a passion for yoga and travel. Looking for genuine connections.',
        photos: [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
        ],
        interests: ['Marketing', 'Yoga', 'Travel'],
        education: "MBA",
        occupation: 'Marketing Professional',
        isVerified: true,
        isLiked: false,
        gender: 'Female',
        lookingFor: 'Men'
    },
    '6': {
        id: '6',
        name: 'James',
        displayName: 'Jim',
        age: 31,
        location: 'Nairobi, Kenya',
        distance: 8,
        bio: 'Chef and dog lover. Enjoys outdoor activities and cooking for friends.',
        photos: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        ],
        interests: ['Cooking', 'Dogs', 'Outdoors'],
        education: "Culinary School",
        occupation: 'Chef',
        isVerified: false,
        isLiked: true,
        gender: 'Male',
        lookingFor: 'Women'
    }
}

export default function DatingProfileViewPage() {
    const params = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
    const [isLiked, setIsLiked] = useState(false)
    const [showMatchModal, setShowMatchModal] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true)
            setTimeout(() => {
                const profileData = MOCK_DATING_DATA[params.id as string]
                if (profileData) {
                    setProfile(profileData)
                    setIsLiked(profileData.isLiked)
                }
                setIsLoading(false)
            }, 600)
        }

        fetchProfile()
    }, [params.id])

    const handleLike = () => {
        setIsLiked(!isLiked)

        // Simulate match (30% chance)
        if (!isLiked && Math.random() > 0.7) {
            setTimeout(() => {
                setShowMatchModal(true)
            }, 500)
        }
    }

    const handleMessage = () => {
        if (!profile) return
        // Navigate to chat
        router.push(`/chat/${profile.id}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        )
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
                                src={profile.photos[selectedPhotoIndex]}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                            />
                            {profile.isVerified && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-full">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Verified</span>
                                </div>
                            )}
                        </div>

                        {/* Photo Thumbnails */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {profile.photos.map((photo: string, index: number) => (
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
                                        alt={`${profile.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* About */}
                        <div className="bg-white rounded-xl p-6 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
                            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                        </div>

                        {/* Interests */}
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

                        {/* Additional Info */}
                        {(profile.education || profile.occupation) && (
                            <div className="bg-white rounded-xl p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">More About Me</h2>
                                <div className="space-y-4">
                                    {profile.education && (
                                        <div className="flex items-start">
                                            <GraduationCap className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Education</p>
                                                <p className="text-gray-900 font-medium">{profile.education}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.occupation && (
                                        <div className="flex items-start">
                                            <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Occupation</p>
                                                <p className="text-gray-900 font-medium">{profile.occupation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 sticky top-24">
                            {/* Name & Basic Info */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {profile.displayName || profile.name}, {profile.age}
                                </h1>
                                <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{profile.location}</span>
                                </div>
                                <p className="text-sm text-gray-500">{profile.distance} km away</p>
                            </div>

                            {/* Quick Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Gender</span>
                                    <span className="text-gray-900 font-medium">{profile.gender}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Looking for</span>
                                    <span className="text-gray-900 font-medium">{profile.lookingFor}</span>
                                </div>
                            </div>

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
                                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                                </button>

                                <button
                                    onClick={handleMessage}
                                    className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>Send Message</span>
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
                                You and {profile.name} liked each other
                            </p>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={profile.photos[0]}
                                alt={profile.name}
                                className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-pink-100"
                            />
                            <h3 className="text-xl font-semibold text-gray-900">
                                {profile.name}, {profile.age}
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
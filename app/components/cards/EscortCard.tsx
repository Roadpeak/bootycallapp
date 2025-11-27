'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, MessageSquare, Lock, Unlock, Phone, MapPin } from 'lucide-react'
import { getImageUrl } from '@/lib/utils/image'

// Combined interface for all profile types
export interface ProfileData {
    id: string
    name: string
    age: number
    distance?: string | number
    bio?: string
    photos: string[]
    // Dating specific
    isVerified?: boolean
    isLiked?: boolean
    tags?: string[]
    // Hookup/Escort specific
    rating?: number
    price?: number
    isUnlocked?: boolean
    isVip?: boolean
    hasDirectCall?: boolean
    services?: (string | { name: string })[]
}

interface DatingCardProps {
    profile: ProfileData
    onLike?: (id: string) => void
    onMessage?: (id: string) => void
    onView?: (id: string) => void
    className?: string
}

interface EscortCardProps {
    profile: ProfileData
    onUnlock?: (id: string) => void
    onCall?: (id: string) => void
    className?: string
}

// Dating Card Component
export const DatingCard: React.FC<DatingCardProps> = ({
    profile,
    onLike,
    onMessage,
    className = '',
}) => {
    const { id, name, age, distance, bio, photos, isLiked, tags } = profile

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onLike) onLike(id)
    }

    const handleMessage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onMessage) onMessage(id)
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <Link href={`/dating/profile/${id}`}>
                {/* Profile Image */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                    <img
                        src={getImageUrl(photos[0])}
                        alt={`${name}'s profile`}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />

                    {/* Distance Badge */}
                    {distance && (
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {typeof distance === 'number' ? `${distance} km away` : distance}
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-base text-gray-900">
                            {name}, {age}
                        </h3>
                    </div>

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-pink-50 text-pink-700 text-xs font-medium px-2 py-0.5 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                            {tags.length > 3 && (
                                <span className="text-gray-500 text-xs font-medium">
                                    +{tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Bio */}
                    {bio && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {bio}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleLike}
                            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${isLiked
                                ? 'bg-pink-500 text-white'
                                : 'border border-pink-300 text-pink-700 hover:bg-pink-50'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="hidden lg:inline">{isLiked ? 'Liked' : 'Like'}</span>
                        </button>

                        <button
                            onClick={handleMessage}
                            className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden lg:inline">Message</span>
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    )
}

// Escort Card Component
export const EscortCard: React.FC<EscortCardProps> = ({
    profile,
    onUnlock,
    onCall,
    className = '',
}) => {
    const { id, name, age, distance, bio, photos, price, isUnlocked, isVip, hasDirectCall, services } = profile

    // Helper to get service name from service (can be string or object)
    const getServiceName = (service: string | { name: string }): string => {
        return typeof service === 'string' ? service : service.name
    }

    const handleUnlock = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onUnlock) onUnlock(id)
    }

    const handleCall = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onCall) onCall(id)
    }

    return (
        <div className={`bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <Link href={`/escorts/${id}`}>
                {/* Profile Image */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                    <img
                        src={getImageUrl(photos[0])}
                        alt={`${name}'s profile`}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />

                    {/* VIP Badge */}
                    {isVip && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            VIP
                        </div>
                    )}

                    {/* Gradient overlay at bottom with name */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3">
                        <h3 className="text-white font-bold text-lg drop-shadow-md">
                            {name}, {age}
                        </h3>
                        {distance && (
                            <p className="text-white/90 text-sm drop-shadow-md">
                                {typeof distance === 'number' ? `${distance} km away` : distance}
                            </p>
                        )}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="p-3">
                    {/* Price Row - Only for locked profiles */}
                    {!hasDirectCall && !isUnlocked && !isVip && price && (
                        <div className="flex justify-end mb-2">
                            <span className="text-sm font-bold text-rose-400">
                                KSh {price}
                            </span>
                        </div>
                    )}

                    {/* Bio */}
                    {bio && (
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2 leading-relaxed">
                            {bio}
                        </p>
                    )}

                    {/* Services */}
                    {services && services.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {services.slice(0, 3).map((service, index) => (
                                <span
                                    key={index}
                                    className="bg-rose-500/20 text-rose-300 text-xs font-medium px-2 py-0.5 rounded-full border border-rose-500/30"
                                >
                                    {getServiceName(service)}
                                </span>
                            ))}
                            {services.length > 3 && (
                                <span className="text-gray-400 text-xs font-medium">
                                    +{services.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="w-full">
                        {hasDirectCall ? (
                            <button
                                onClick={handleCall}
                                className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Phone className="w-4 h-4" />
                                Call Now
                            </button>
                        ) : isVip || isUnlocked ? (
                            <button
                                onClick={handleCall}
                                className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Phone className="w-4 h-4" />
                                Call Now
                            </button>
                        ) : (
                            <button
                                onClick={handleUnlock}
                                className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white"
                            >
                                <Lock className="w-4 h-4" />
                                Unlock Escort
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}

// For backward compatibility
export default DatingCard
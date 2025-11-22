// app/components/common/MatchNotificationModal.tsx
'use client'

import React from 'react'
import { X, Heart, MessageCircle } from 'lucide-react'
import type { MatchNotification } from '../types/chat'

interface MatchNotificationModalProps {
    match: MatchNotification
    onClose: () => void
    onSendMessage: () => void
}

export const MatchNotificationModal = ({
    match,
    onClose,
    onSendMessage
}: MatchNotificationModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 animate-ping">
                            <Heart className="w-20 h-20 text-pink-500 fill-current opacity-75" />
                        </div>
                        <Heart className="w-20 h-20 text-pink-500 fill-current relative" />
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">It's a Match!</h2>
                    <p className="text-gray-600">
                        You and {match.matchedUser.name} liked each other
                    </p>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <img
                        src={match.matchedUser.avatar}
                        alt={match.matchedUser.name}
                        className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-pink-100"
                    />
                    <h3 className="text-xl font-semibold text-gray-900">
                        {match.matchedUser.name}, {match.matchedUser.age}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 text-center max-w-xs">
                        {match.matchedUser.bio}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Keep Swiping
                    </button>
                    <button
                        onClick={onSendMessage}
                        className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Send Message
                    </button>
                </div>
            </div>
        </div>
    )
}
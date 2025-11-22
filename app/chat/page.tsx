// app/chat/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MessageCircle, Heart, ArrowLeft, Phone, Video } from 'lucide-react'
import { MatchNotificationModal } from '../components/common/MatchNotificationModal'
import type { Conversation, MatchNotification } from '../components/types/chat'

// Mock data
const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        participants: [
            {
                id: '2',
                name: 'Jessica',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
                isOnline: true
            }
        ],
        lastMessage: {
            content: 'Hey! Would love to grab coffee sometime 😊',
            senderId: '2',
            createdAt: new Date(Date.now() - 1000 * 60 * 5),
            status: 'delivered'
        },
        unreadCount: 2,
        isMatch: true,
        matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        participants: [
            {
                id: '4',
                name: 'David',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
                isOnline: false
            }
        ],
        lastMessage: {
            content: 'That sounds great! What time works for you?',
            senderId: 'me',
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
            status: 'read'
        },
        unreadCount: 0,
        isMatch: true,
        matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '3',
        participants: [
            {
                id: '5',
                name: 'Emily',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
                isOnline: true
            }
        ],
        lastMessage: {
            content: 'I love hiking too! Have you been to Karura Forest?',
            senderId: '5',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'delivered'
        },
        unreadCount: 1,
        isMatch: true,
        matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

const formatMessageTime = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const otherUser = conversation.participants[0]
    const isYou = conversation.lastMessage.senderId === 'me'

    return (
        <Link
            href={`/chat/${conversation.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
            <div className="relative flex-shrink-0">
                <img
                    src={otherUser.avatar}
                    alt={otherUser.name}
                    className="w-14 h-14 rounded-full object-cover"
                />
                {otherUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
                {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{otherUser.name}</h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <p
                        className={`text-sm truncate ${conversation.unreadCount > 0
                                ? 'text-gray-900 font-medium'
                                : 'text-gray-600'
                            }`}
                    >
                        {isYou && (
                            <span className="text-gray-500 mr-1">
                                {conversation.lastMessage.status === 'read' ? '✓✓' : '✓'}
                            </span>
                        )}
                        {conversation.lastMessage.content}
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [newMatch, setNewMatch] = useState<MatchNotification | null>(null)

    useEffect(() => {
        const fetchConversations = async () => {
            setIsLoading(true)
            setTimeout(() => {
                setConversations(MOCK_CONVERSATIONS)
                setIsLoading(false)
            }, 800)
        }

        fetchConversations()
    }, [])

    const filteredConversations = conversations.filter(conv =>
        conv.participants[0].name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

    return (
        <div className="min-h-screen bg-white">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dating"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-600">{unreadCount} unread</p>
                                )}
                            </div>
                        </div>

                        <Link
                            href="/dating/matches"
                            className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                        >
                            <Heart className="w-4 h-4 fill-current" />
                            <span className="font-medium hidden sm:inline">Matches</span>
                        </Link>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto">
                {isLoading ? (
                    <div className="divide-y divide-gray-100">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="flex items-center gap-3 p-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="bg-gray-200 h-4 rounded w-1/3 mb-2 animate-pulse"></div>
                                    <div className="bg-gray-200 h-3 rounded w-2/3 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredConversations.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredConversations.map(conversation => (
                            <ConversationItem key={conversation.id} conversation={conversation} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No conversations found' : 'No messages yet'}
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-sm">
                            {searchQuery
                                ? 'Try searching for a different name'
                                : 'Start matching with people to begin chatting'}
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/dating"
                                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition-colors"
                            >
                                Discover People
                            </Link>
                        )}
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
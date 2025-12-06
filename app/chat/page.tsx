'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Search, AlertCircle, Loader2 } from 'lucide-react'
import ChatService, { Conversation } from '@/services/chat-service'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { DatingProfile } from '@/services/butical-api-service'
import { getImageUrl } from '@/lib/utils/image'

const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ChatPage() {
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Check authentication
        const token = TokenService.getAccessToken()
        if (!token) {
            router.push('/auth/login')
            return
        }

        loadConversations()

        // Connect to WebSocket for real-time updates
        const socket = ChatService.connect()

        // Listen for new messages to update conversation list
        const handleNewMessage = () => {
            loadConversations()
        }

        ChatService.onNewMessage(handleNewMessage)
        ChatService.onMessageSent(handleNewMessage)

        return () => {
            ChatService.removeListener('new_message', handleNewMessage)
            ChatService.removeListener('message_sent', handleNewMessage)
        }
    }, [router])

    useEffect(() => {
        // Filter conversations based on search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            setFilteredConversations(
                conversations.filter(conv =>
                    conv.otherParticipant.displayName?.toLowerCase().includes(query) ||
                    conv.otherParticipant.firstName?.toLowerCase().includes(query) ||
                    conv.otherParticipant.lastName?.toLowerCase().includes(query) ||
                    conv.lastMessagePreview?.toLowerCase().includes(query)
                )
            )
        } else {
            setFilteredConversations(conversations)
        }
    }, [searchQuery, conversations])

    const loadConversations = async () => {
        try {
            setError(null)
            const data = await ChatService.getConversations()
            console.log('Loaded conversations:', data)
            console.log('First conversation participant:', data[0]?.otherParticipant)
            setConversations(data)
            setFilteredConversations(data)
        } catch (err: any) {
            console.error('Failed to load conversations:', err)
            setError(err.response?.data?.message || 'Failed to load conversations')
        } finally {
            setLoading(false)
        }
    }

    const getTotalUnread = () => {
        return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading conversations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                            {getTotalUnread() > 0 && (
                                <p className="text-sm text-gray-600">
                                    {getTotalUnread()} unread message{getTotalUnread() !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                        <MessageCircle className="w-8 h-8 text-pink-500" />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Conversations List */}
            <div className="max-w-4xl mx-auto">
                {filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No conversations found' : 'No messages yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Start chatting with someone to see your conversations here'
                            }
                        </p>
                        {!searchQuery && (
                            <Link href="/dating">
                                <button className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                                    Browse Profiles
                                </button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredConversations.map((conversation) => (
                            <Link
                                key={conversation.id}
                                href={`/chat/${conversation.otherParticipant.id}`}
                                className="block bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="px-4 py-4 flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {conversation.otherParticipant.profilePhoto ? (
                                            <img
                                                src={getImageUrl(conversation.otherParticipant.profilePhoto)}
                                                alt={conversation.otherParticipant.displayName || 'User'}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    // If image fails to load, hide it and show fallback
                                                    e.currentTarget.style.display = 'none'
                                                    if (e.currentTarget.nextElementSibling) {
                                                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg"
                                            style={{ display: conversation.otherParticipant.profilePhoto ? 'none' : 'flex' }}
                                        >
                                            {conversation.otherParticipant.displayName?.charAt(0)?.toUpperCase() ||
                                                conversation.otherParticipant.firstName?.charAt(0)?.toUpperCase() ||
                                                '?'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2 mb-1">
                                            <h3 className={`font-semibold text-gray-900 truncate ${
                                                conversation.unreadCount > 0 ? 'font-bold' : ''
                                            }`}>
                                                {conversation.otherParticipant.displayName ||
                                                    `${conversation.otherParticipant.firstName} ${conversation.otherParticipant.lastName}`}
                                            </h3>
                                            {conversation.lastMessageAt && (
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {formatMessageTime(conversation.lastMessageAt)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm truncate ${
                                                conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                                            }`}>
                                                {conversation.lastMessagePreview || 'No messages yet'}
                                            </p>
                                            {conversation.unreadCount > 0 && (
                                                <span className="flex-shrink-0 bg-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-2 flex items-center justify-center">
                                                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
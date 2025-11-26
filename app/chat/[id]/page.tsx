'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react'
import ChatService, { Message, ConversationDetail } from '@/services/chat-service'
import { TokenService } from '@/services/butical-api-service'

const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' })

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                        ? 'bg-pink-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
            >
                <p className="text-sm md:text-base break-words whitespace-pre-wrap">{message.content}</p>
                <div
                    className={`flex items-center gap-1 mt-1 text-xs ${
                        isOwn ? 'text-pink-100 justify-end' : 'text-gray-500'
                    }`}
                >
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {isOwn && (
                        <span className="ml-1">
                            {message.isRead ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

const DateSeparator = ({ timestamp }: { timestamp: string }) => {
    return (
        <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                {formatDateSeparator(timestamp)}
            </div>
        </div>
    )
}

export default function ChatDetailPage() {
    const params = useParams()
    const router = useRouter()
    const conversationId = params.id as string

    const [conversation, setConversation] = useState<ConversationDetail | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        // Check authentication
        const token = TokenService.getAccessToken()
        if (!token) {
            router.push('/auth/login')
            return
        }

        loadConversationData()

        // Connect to WebSocket
        const socket = ChatService.connect()

        // Listen for new messages
        const handleNewMessage = (event: any) => {
            if (event.conversationId === conversationId) {
                setMessages(prev => [...prev, event.message])
                scrollToBottom()
            }
        }

        // Listen for message sent confirmations
        const handleMessageSent = (event: any) => {
            if (event.conversationId === conversationId) {
                setMessages(prev => [...prev, event.message])
                scrollToBottom()
            }
        }

        // Listen for messages read confirmations
        const handleMessagesRead = (event: any) => {
            if (event.conversationId === conversationId && event.success) {
                setMessages(prev =>
                    prev.map(msg => ({
                        ...msg,
                        isRead: true,
                        readAt: new Date().toISOString()
                    }))
                )
            }
        }

        // Listen for typing indicators
        const handleUserTyping = (event: any) => {
            const otherParticipant = conversation?.participant1.id === currentUserId
                ? conversation?.participant2
                : conversation?.participant1

            if (event.userId === otherParticipant?.id) {
                setIsTyping(event.isTyping)
            }
        }

        ChatService.onNewMessage(handleNewMessage)
        ChatService.onMessageSent(handleMessageSent)
        ChatService.onMessagesRead(handleMessagesRead)
        ChatService.onUserTyping(handleUserTyping)

        // Mark conversation as read when viewing
        ChatService.markRead(conversationId)

        return () => {
            ChatService.removeListener('new_message', handleNewMessage)
            ChatService.removeListener('message_sent', handleMessageSent)
            ChatService.removeListener('messages_read', handleMessagesRead)
            ChatService.removeListener('user_typing', handleUserTyping)
        }
    }, [conversationId, router, conversation, currentUserId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadConversationData = async () => {
        try {
            setError(null)

            // Get user ID from token or API
            // For now, we'll get it from the conversation data

            // Load messages
            const messageData = await ChatService.getMessages(conversationId)
            setMessages(messageData.data)

            // Extract current user ID from messages
            if (messageData.data.length > 0) {
                // Find a message we sent to determine our user ID
                const sentMessage = messageData.data.find(msg => msg.sender)
                if (sentMessage) {
                    // This is a simplification - in reality you'd get this from auth context
                    setCurrentUserId(sentMessage.senderId)
                }
            }

            scrollToBottom()
        } catch (err: any) {
            console.error('Failed to load conversation:', err)
            setError(err.response?.data?.message || 'Failed to load conversation')
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newMessage.trim() || sending) return

        // Get recipient ID
        const recipientId = conversation?.participant1.id === currentUserId
            ? conversation?.participant2.id
            : conversation?.participant1.id

        if (!recipientId) {
            console.error('No recipient ID found')
            return
        }

        setSending(true)
        const messageContent = newMessage.trim()
        setNewMessage('')

        try {
            // Send via WebSocket
            await ChatService.sendMessage(recipientId, messageContent)

            // Stop typing indicator
            ChatService.stopTyping(recipientId)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
        } catch (err: any) {
            console.error('Failed to send message:', err)
            setError(err.message || 'Failed to send message')
            // Restore message in input on error
            setNewMessage(messageContent)
        } finally {
            setSending(false)
        }
    }

    const handleTyping = (value: string) => {
        setNewMessage(value)

        const recipientId = conversation?.participant1.id === currentUserId
            ? conversation?.participant2.id
            : conversation?.participant1.id

        if (!recipientId) return

        // Send typing start event
        ChatService.startTyping(recipientId)

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set timeout to send typing stop event
        typingTimeoutRef.current = setTimeout(() => {
            ChatService.stopTyping(recipientId)
        }, 2000)
    }

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.createdAt).toDateString()
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(message)
        return groups
    }, {} as Record<string, Message[]>)

    // Get other participant info
    const otherParticipant = conversation?.participant1.id === currentUserId
        ? conversation?.participant2
        : conversation?.participant1

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading conversation...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {otherParticipant?.displayName?.charAt(0)?.toUpperCase() ||
                                    otherParticipant?.firstName?.charAt(0)?.toUpperCase() ||
                                    '?'}
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    {otherParticipant?.displayName ||
                                        `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                                </h2>
                                {isTyping && (
                                    <p className="text-xs text-pink-500">Typing...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="px-4 py-2 bg-red-50 border-b border-red-200">
                    <div className="max-w-4xl mx-auto flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                            <p className="text-gray-500 mb-2">No messages yet</p>
                            <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                <DateSeparator timestamp={msgs[0].createdAt} />
                                {msgs.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        isOwn={message.senderId === currentUserId}
                                    />
                                ))}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </main>

            {/* Input */}
            <footer className="border-t border-gray-200 px-4 py-3 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            disabled={sending}
                            maxLength={5000}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </footer>
        </div>
    )
}

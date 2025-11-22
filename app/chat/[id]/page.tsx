// app/chat/[id]/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, Phone, Video } from 'lucide-react'
import type { Message } from '../../components/types/chat'

const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        conversationId: '1',
        senderId: '2',
        receiverId: 'me',
        content: 'Hey! I saw you like photography too 📸',
        type: 'text',
        status: 'read',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    },
    {
        id: '2',
        conversationId: '1',
        senderId: 'me',
        receiverId: '2',
        content: 'Yes! I love landscape and street photography. What about you?',
        type: 'text',
        status: 'read',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 23)
    },
    {
        id: '3',
        conversationId: '1',
        senderId: '2',
        receiverId: 'me',
        content: 'Mostly portraits and nature. Would love to go on a photo walk sometime!',
        type: 'text',
        status: 'read',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22)
    },
    {
        id: '4',
        conversationId: '1',
        senderId: 'me',
        receiverId: '2',
        content: 'That would be amazing! Have you been to Karura Forest? Great spot for both nature and portraits',
        type: 'text',
        status: 'read',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
        id: '5',
        conversationId: '1',
        senderId: '2',
        receiverId: 'me',
        content: 'Hey! Would love to grab coffee sometime 😊',
        type: 'text',
        status: 'delivered',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5)
    }
]

const MOCK_USER = {
    id: '2',
    name: 'Jessica',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    isOnline: true,
    lastSeen: new Date(Date.now() - 1000 * 60 * 2)
}

const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const formatDateSeparator = (date: Date) => {
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
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                        ? 'bg-pink-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
            >
                <p className="text-sm md:text-base break-words">{message.content}</p>
                <div
                    className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-pink-100 justify-end' : 'text-gray-500'
                        }`}
                >
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {isOwn && (
                        <span className="ml-1">
                            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

const DateSeparator = ({ date }: { date: Date }) => {
    return (
        <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                {formatDateSeparator(date)}
            </div>
        </div>
    )
}

export default function ChatDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [user, setUser] = useState(MOCK_USER)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true)
            setTimeout(() => {
                setMessages(MOCK_MESSAGES)
                setIsLoading(false)
                scrollToBottom()
            }, 600)
        }

        fetchMessages()
    }, [params.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newMessage.trim() || isSending) return

        setIsSending(true)

        const message: Message = {
            id: Date.now().toString(),
            conversationId: params.id as string,
            senderId: 'me',
            receiverId: user.id,
            content: newMessage.trim(),
            type: 'text',
            status: 'sent',
            createdAt: new Date(),
            updatedAt: new Date()
        }

        setMessages(prev => [...prev, message])
        setNewMessage('')

        setTimeout(() => {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === message.id ? { ...msg, status: 'delivered' } : msg
                )
            )
            setIsSending(false)
        }, 500)

        setTimeout(() => {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === message.id ? { ...msg, status: 'read' } : msg
                )
            )
        }, 2000)
    }

    const groupedMessages = messages.reduce((groups, message) => {
        const date = message.createdAt.toDateString()
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(message)
        return groups
    }, {} as Record<string, Message[]>)

    return (
        <div className="flex flex-col h-screen bg-white">
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
                            <div className="relative">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                {user.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-xs text-gray-500">
                                    {user.isOnline ? 'Active now' : `Last seen ${formatMessageTime(user.lastSeen)}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Phone className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Video className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                ) : (
                    <>
                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                <DateSeparator date={new Date(date)} />
                                {msgs.map(message => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        isOwn={message.senderId === 'me'}
                                    />
                                ))}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </main>

            <footer className="border-t border-gray-200 px-4 py-3 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-1"
                    >
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            disabled={isSending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    )
}
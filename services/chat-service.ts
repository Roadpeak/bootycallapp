// services/chat-service.ts
import { io, Socket } from 'socket.io-client'
import ButicalAPI, { TokenService } from './butical-api-service'
import config from './config'

// ==================== TYPE DEFINITIONS ====================

export interface ChatUser {
    id: string
    displayName: string
    firstName: string
    lastName: string
    role: string
    profilePhoto?: string
}

export interface Message {
    id: string
    conversationId: string
    senderId: string
    content: string
    isRead: boolean
    readAt?: string
    createdAt: string
    sender?: ChatUser
}

export interface Conversation {
    id: string
    otherParticipant: ChatUser
    lastMessageAt?: string
    lastMessagePreview?: string
    unreadCount: number
    createdAt: string
}

export interface ConversationDetail {
    id: string
    participant1: ChatUser
    participant2: ChatUser
    createdAt: string
}

export interface MessageHistory {
    data: Message[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface ChatAccessResponse {
    canChat: boolean
    userId: string
}

// WebSocket event types
export interface SendMessagePayload {
    recipientId: string
    content: string
}

export interface SendMessageCallback {
    success: boolean
    message?: Message
    error?: string
}

export interface MarkReadPayload {
    conversationId: string
}

export interface TypingPayload {
    recipientId: string
}

export interface NewMessageEvent {
    conversationId: string
    message: Message
}

export interface MessageSentEvent {
    conversationId: string
    message: Message
}

export interface MessagesReadEvent {
    conversationId: string
    success: boolean
}

export interface UserTypingEvent {
    userId: string
    isTyping: boolean
}

// ==================== CHAT SERVICE ====================

class ChatService {
    private socket: Socket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000

    // ==================== REST API METHODS ====================

    /**
     * Get all conversations for the current user
     */
    async getConversations(): Promise<Conversation[]> {
        try {
            const response = await ButicalAPI.chat.getConversations()
            return response.data?.data || response.data || []
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
            throw error
        }
    }

    /**
     * Start or get conversation with a user
     */
    async startConversation(recipientId: string): Promise<ConversationDetail> {
        try {
            const response = await ButicalAPI.chat.startConversation(recipientId)
            return response.data?.data || response.data
        } catch (error) {
            console.error('Failed to start conversation:', error)
            throw error
        }
    }

    /**
     * Get message history for a conversation
     */
    async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<MessageHistory> {
        try {
            const response = await ButicalAPI.chat.getMessages(conversationId, { page, limit })
            return response.data
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            throw error
        }
    }

    /**
     * Mark all messages in a conversation as read
     */
    async markConversationAsRead(conversationId: string): Promise<void> {
        try {
            await ButicalAPI.chat.markAsRead(conversationId)
        } catch (error) {
            console.error('Failed to mark conversation as read:', error)
            throw error
        }
    }

    /**
     * Check if current user can chat with specified user
     */
    async checkChatAccess(userId: string): Promise<ChatAccessResponse> {
        try {
            const response = await ButicalAPI.chat.checkAccess(userId)
            return response.data?.data || response.data
        } catch (error) {
            console.error('Failed to check chat access:', error)
            throw error
        }
    }

    // ==================== WEBSOCKET METHODS ====================

    /**
     * Connect to WebSocket server
     */
    connect(): Socket {
        if (this.socket?.connected) {
            console.log('Socket already connected')
            return this.socket
        }

        const token = TokenService.getAccessToken()
        if (!token) {
            throw new Error('No authentication token available')
        }

        console.log('Connecting to chat server:', config.api.wsUrl)
        this.socket = io(config.api.wsUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
        })

        this.setupSocketListeners()
        return this.socket
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.socket) {
            console.log('Disconnecting from chat server...')
            this.socket.disconnect()
            this.socket = null
            this.reconnectAttempts = 0
        }
    }

    /**
     * Get the current socket instance
     */
    getSocket(): Socket | null {
        return this.socket
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false
    }

    /**
     * Setup socket event listeners
     */
    private setupSocketListeners(): void {
        if (!this.socket) return

        this.socket.on('connect', () => {
            console.log('Connected to chat server')
            this.reconnectAttempts = 0
        })

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from chat server:', reason)
        })

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error)
            this.reconnectAttempts++

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached')
                this.disconnect()
            }
        })
    }

    // ==================== WEBSOCKET EVENTS (CLIENT → SERVER) ====================

    /**
     * Send a message to another user
     */
    sendMessage(recipientId: string, content: string): Promise<SendMessageCallback> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Socket not connected'))
                return
            }

            if (!content || content.length < 1 || content.length > 5000) {
                reject(new Error('Message must be between 1 and 5000 characters'))
                return
            }

            this.socket.emit('send_message', { recipientId, content }, (response: SendMessageCallback) => {
                if (response.success) {
                    resolve(response)
                } else {
                    reject(new Error(response.error || 'Failed to send message'))
                }
            })
        })
    }

    /**
     * Mark messages in a conversation as read
     */
    markRead(conversationId: string): void {
        if (!this.socket?.connected) {
            console.warn('Socket not connected, cannot mark as read')
            return
        }

        this.socket.emit('mark_read', { conversationId })
    }

    /**
     * Notify that user started typing
     */
    startTyping(recipientId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit('typing_start', { recipientId })
    }

    /**
     * Notify that user stopped typing
     */
    stopTyping(recipientId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit('typing_stop', { recipientId })
    }

    // ==================== WEBSOCKET EVENTS (SERVER → CLIENT) ====================

    /**
     * Listen for new messages
     */
    onNewMessage(callback: (event: NewMessageEvent) => void): void {
        this.socket?.on('new_message', callback)
    }

    /**
     * Listen for message sent confirmations
     */
    onMessageSent(callback: (event: MessageSentEvent) => void): void {
        this.socket?.on('message_sent', callback)
    }

    /**
     * Listen for messages read confirmations
     */
    onMessagesRead(callback: (event: MessagesReadEvent) => void): void {
        this.socket?.on('messages_read', callback)
    }

    /**
     * Listen for typing indicators
     */
    onUserTyping(callback: (event: UserTypingEvent) => void): void {
        this.socket?.on('user_typing', callback)
    }

    /**
     * Remove event listeners
     */
    removeListener(event: string, callback?: (...args: any[]) => void): void {
        if (callback) {
            this.socket?.off(event, callback)
        } else {
            this.socket?.off(event)
        }
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string): void {
        if (event) {
            this.socket?.removeAllListeners(event)
        } else {
            this.socket?.removeAllListeners()
        }
    }
}

// Export singleton instance
export default new ChatService()

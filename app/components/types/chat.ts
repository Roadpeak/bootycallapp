// types/chat.ts
export interface Message {
    id: string
    conversationId: string
    senderId: string
    receiverId: string
    content: string
    type: 'text' | 'image' | 'video'
    status: 'sent' | 'delivered' | 'read'
    createdAt: Date
    updatedAt: Date
}

export interface Conversation {
    id: string
    participants: {
        id: string
        name: string
        avatar: string
        isOnline: boolean
    }[]
    lastMessage: {
        content: string
        senderId: string
        createdAt: Date
        status: 'sent' | 'delivered' | 'read'
    }
    unreadCount: number
    isMatch: boolean
    matchedAt?: Date
    createdAt: Date
    updatedAt: Date
}

export interface MatchNotification {
    id: string
    matchedUser: {
        id: string
        name: string
        age: number
        avatar: string
        bio: string
    }
    matchedAt: Date
    isNew: boolean
}
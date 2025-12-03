// lib/butical-api-service.ts
import axios, { AxiosInstance, AxiosError } from 'axios'
import config from './config'

// ==================== BASE CONFIGURATION ====================
const BASE_URL = config.api.baseUrl

// ==================== TYPE DEFINITIONS ====================

// Auth Types
export interface RegisterData {
    email: string
    phone: string
    password: string
    firstName: string
    lastName: string
    role: 'DATING_USER' | 'ESCORT' | 'HOOKUP_USER'
    [key: string]: any
}

export interface DatingUserRegistration {
    email: string
    phone: string
    password: string
    firstName: string
    lastName: string
    role: 'DATING_USER'
    gender: string
    dateOfBirth: string
    bio: string
    termsAccepted: boolean
    ageConfirmed: boolean
    // Optional fields
    displayName?: string
    sexualOrientation?: string
    city?: string
    country?: string
    lookingFor?: string
    interests?: string[]
    education?: string
    occupation?: string
    referralCode?: string
    photos?: string[] // base64 encoded
}

export interface EscortRegistration {
    email: string
    phone: string
    password: string
    firstName: string
    lastName: string
    role: 'ESCORT'
    contactPhone: string
    about: string
    languages: string[]
    termsAccepted: boolean
    ageConfirmed: boolean
    // Optional fields
    displayName?: string
    dateOfBirth?: string
    gender?: string
    city?: string
    hourlyRate?: number
    referralCode?: string
    photos?: string[] // base64 encoded
    services?: string[]
    availability?: Record<string, { available: boolean; from: string; to: string }>
}

export interface HookupUserRegistration {
    email: string
    phone: string
    password: string
    firstName: string
    lastName: string
    role: 'HOOKUP_USER'
    termsAccepted: boolean
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    user: User
    accessToken?: string
    refreshToken?: string
    // Alternative nested structure that the API might use
    tokens?: {
        accessToken: string
        refreshToken: string
    }
}

// API Response wrapper - the actual API wraps responses in { status, data } or { status, message }
export interface ApiResponseWrapper<T> {
    status: string
    data: T
    message?: string
}

// User Types
export interface User {
    id: string
    email: string
    phone: string
    firstName: string
    lastName: string
    displayName?: string
    role: 'DATING_USER' | 'ESCORT' | 'HOOKUP_USER' | 'ADMIN'
    isVerified: boolean
    createdAt: string
    updatedAt: string
}

export interface Subscription {
    id?: string
    userId: string
    role?: 'DATING_USER' | 'ESCORT'
    type?: 'BASIC' | 'PREMIUM' | 'VIP'
    status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
    isSubscribed: boolean
    expiresAt: string
    startDate?: string
    endDate?: string
    autoRenew?: boolean
}

// Escort Types - matches API response structure
export interface EscortLocation {
    city?: string
    area?: string
    country?: string
}

export interface EscortServiceObject {
    name: string
    description?: string
}

// Services can be either strings or objects depending on API response
export type EscortService = string | EscortServiceObject

export interface EscortPricing {
    hourlyRate?: number
    unlockPrice?: number
    currency?: string
}

export interface EscortAvailability {
    [day: string]: {
        available: boolean
        from?: string
        to?: string
    }
}

export interface EscortUser {
    id: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
}

export interface Escort {
    id: string
    userId: string
    about: string
    contactPhone: string
    locations: EscortLocation
    photos: string[]
    videos?: string[]
    services: EscortService[]
    pricing: EscortPricing
    availability: EscortAvailability
    languages: string[]
    verified: boolean
    vipStatus: boolean
    vipExpiresAt?: string
    moderationStatus: string
    unlockPrice: number
    experienceYears?: number
    tags: string[]
    user: EscortUser
    createdAt: string
    contactHidden: boolean
    // Additional profile fields
    dateOfBirth?: string
    gender?: string
    ethnicity?: string
    category?: string
    city?: string
    isNew?: boolean
    // Computed/display properties (for backwards compatibility)
    displayName?: string
    location?: string
    hourlyRate?: number
    isVerified?: boolean
    isVIP?: boolean
    rating?: number
    reviewCount?: number
    views?: number
}

export interface EscortListParams {
    location?: string
    city?: string
    minAge?: number
    maxAge?: number
    minRate?: number
    maxRate?: number
    services?: string[]
    vipStatus?: boolean
    verified?: boolean
    page?: number
    limit?: number
}

export interface PaginationInfo {
    total: number
    page: number
    limit: number
    pages: number
}

export interface EscortsListResponse {
    escorts: Escort[]
    pagination: PaginationInfo
}

export interface EscortStats {
    views: number
    unlocks: number
    rating: number
    reviewCount: number
}

// Dating Profile Types
export interface DatingProfileUser {
    id: string
    displayName?: string
    firstName: string
}

export interface DatingProfileLocation {
    city?: string
    area?: string
    country?: string
}

export interface DatingProfile {
    id: string
    userId: string
    gender: string
    dateOfBirth: string
    sexualOrientation?: string
    interests: string[]
    photos: string[]
    bio: string
    location: DatingProfileLocation | Record<string, any>
    lookingFor?: string
    education?: string
    occupation?: string
    user: DatingProfileUser
    // Backwards compatibility / computed fields
    name?: string
    age?: number
    isVerified?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface DatingProfileUpdateData {
    gender?: string
    dateOfBirth?: string
    sexualOrientation?: string
    interests?: string[]
    photos?: string[]
    bio?: string
    location?: DatingProfileLocation | Record<string, any>
    lookingFor?: string
    education?: string
    occupation?: string
}

export interface DatingSearchParams {
    gender?: string
    minAge?: number
    maxAge?: number
    city?: string
    interests?: string
    page?: number
    limit?: number
}

export interface DatingSearchResponse {
    profiles: DatingProfile[]
    pagination: PaginationInfo
}

// Hookup Profile Types
export interface HookupProfilePreferences {
    gender?: string
    ageRange?: {
        min: number
        max: number
    }
    location?: string
    priceRange?: { min: number; max: number }
}

export interface HookupProfile {
    id: string
    userId: string
    savedEscorts: string[]
    preferences: HookupProfilePreferences
}

export interface HookupProfileUpdateData {
    preferences?: HookupProfilePreferences
}

// Payment Types
export interface PaymentInitiateResponse {
    paymentId: string
    checkoutRequestId: string
    message: string
}

export interface PaymentStatus {
    id: string
    payerUserId?: string
    payerPhone: string
    amount: number
    currency: 'KES'
    type: 'DATING_SUBSCRIPTION' | 'ESCORT_UNLOCK' | 'VIP_SUBSCRIPTION'
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
    mpesaTxnId?: string
    createdAt: string
    accessToken?: string // For completed unlock payments
}

// Legacy types for backwards compatibility
export interface PaymentRequest {
    phone: string
    escortId?: string
}

export interface PaymentResponse {
    paymentId: string
    checkoutRequestId: string
    message: string
}

// Referral Types
export interface ReferralCodeResponse {
    referralCode: string
}

export interface ReferralApplyResponse {
    message: string
    applied: boolean
}

export interface ReferredUser {
    id: string
    displayName: string
    createdAt: string
}

export interface MyReferralsResponse {
    referrals: ReferredUser[]
    totalCount: number
    totalEarnings: number
}

// Legacy type for backwards compatibility
export interface ReferralCode {
    code: string
    userId: string
    earnings: number
    referralCount: number
}

export interface Referral {
    id: string
    referrerId: string
    referredId: string
    status: 'PENDING' | 'COMPLETED'
    commission: number
    createdAt: string
}

// Wallet Types
export interface WalletSummary {
    currentBalance: number
    totalEarnings: number
    totalWithdrawals: number
    pendingWithdrawals: number
    // Legacy alias for backwards compatibility
    balance?: number
}

export interface WalletTransaction {
    id: string
    userId: string
    type: 'EARNING' | 'WITHDRAWAL' | 'REFUND' | 'REFERRAL_CREDIT'
    amount: number
    description: string
    status: 'COMPLETED' | 'PENDING' | 'FAILED'
    createdAt: string
}

export interface WalletTransactionsResponse {
    transactions: WalletTransaction[]
    total: number
    page: number
    limit: number
}

export interface WithdrawRequest {
    amount: number
    phone: string
}

export interface WithdrawResponse {
    message: string
    transactionId: string
    status: 'PENDING'
}

// Access Token Types
export interface AccessTokenResponse {
    escortId: string
    displayName: string
    contactPhone: string
    expiresAt: string
}

// Review Types
export interface Review {
    id: string
    userId: string
    targetId: string
    targetType: 'ESCORT' | 'DATING_PROFILE'
    rating: number
    comment: string
    createdAt: string
    updatedAt: string
}

export interface CreateReview {
    targetId: string
    targetType: 'ESCORT' | 'DATING_PROFILE'
    rating: number
    comment: string
}

export interface ReviewParams {
    page?: number
    limit?: number
}

// Upload Types
export type UploadFolder = 'profiles' | 'escorts' | 'dating' | 'general'

export interface UploadedImage {
    url: string
    publicId: string
    width: number
    height: number
    format: string
    size: number
}

export interface UploadResponse {
    status: string
    data: UploadedImage
}

export interface MultiUploadResponse {
    status: string
    data: {
        uploaded: UploadedImage[]
        failed: { file: string; error: string }[]
    }
}

export interface DeleteImageRequest {
    publicId: string
}

export interface DeleteImagesRequest {
    publicIds: string[]
}

export interface DeleteImageResponse {
    status: string
    data: {
        deleted: boolean
        publicId: string
    }
}

export interface DeleteImagesResponse {
    status: string
    data: {
        deleted: string[]
        failed: { publicId: string; error: string }[]
    }
}

// API Response Type
export interface ApiResponse<T = any> {
    data: T
    message?: string
    status: number
}

// ==================== TOKEN MANAGEMENT ====================
class TokenService {
    private static readonly ACCESS_TOKEN_KEY = 'accessToken'
    private static readonly REFRESH_TOKEN_KEY = 'refreshToken'

    static getAccessToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(this.ACCESS_TOKEN_KEY)
    }

    static setAccessToken(token: string): void {
        if (typeof window === 'undefined') return
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token)
    }

    static getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }

    static setRefreshToken(token: string): void {
        if (typeof window === 'undefined') return
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
    }

    static setTokens(accessToken: string, refreshToken: string): void {
        this.setAccessToken(accessToken)
        this.setRefreshToken(refreshToken)
    }

    static clearTokens(): void {
        if (typeof window === 'undefined') return
        localStorage.removeItem(this.ACCESS_TOKEN_KEY)
        localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    }
}

// ==================== AXIOS INSTANCE ====================
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
})

// Request Interceptor - Add token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = TokenService.getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (with token)`)
        } else {
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (no token)`)
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor - Handle token refresh and rate limiting
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = TokenService.getRefreshToken()
                if (refreshToken) {
                    console.log('Attempting to refresh token...')
                    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                        refreshToken,
                    })

                    const { accessToken, refreshToken: newRefreshToken } = response.data

                    TokenService.setAccessToken(accessToken)
                    if (newRefreshToken) {
                        TokenService.setRefreshToken(newRefreshToken)
                    }

                    console.log('Token refreshed successfully')
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    return apiClient(originalRequest)
                } else {
                    console.warn('No refresh token available for 401 error')
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
                TokenService.clearTokens()
                // Only redirect if we're not already on an auth page
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                    console.log('Redirecting to login due to failed token refresh')
                    window.location.href = '/auth/login'
                }
                return Promise.reject(refreshError)
            }
        }

        // Handle 429 Too Many Requests - Rate limiting
        if (error.response?.status === 429) {
            console.warn('Rate limit exceeded. Please wait before making more requests.')
        }

        return Promise.reject(error)
    }
)

// ==================== API METHODS ====================
const ButicalAPI = {
    // AUTH
    auth: {
        register: (data: DatingUserRegistration | EscortRegistration | HookupUserRegistration) =>
            apiClient.post<ApiResponseWrapper<AuthResponse>>('/auth/register', data),
        login: (credentials: LoginCredentials) =>
            apiClient.post<ApiResponseWrapper<AuthResponse>>('/auth/login', credentials),
        refresh: () => apiClient.post<ApiResponseWrapper<AuthResponse>>('/auth/refresh'),
        logout: () => {
            TokenService.clearTokens()
            return Promise.resolve()
        },
    },

    // USERS
    users: {
        getMe: () => apiClient.get<ApiResponseWrapper<User>>('/users/me'),
        updateMe: (data: Partial<User>) => apiClient.put<ApiResponseWrapper<User>>('/users/me', data),
        getSubscription: () => apiClient.get<ApiResponseWrapper<Subscription>>('/users/subscription'),
    },

    // ESCORTS
    escorts: {
        list: (params?: EscortListParams) =>
            apiClient.get<ApiResponseWrapper<EscortsListResponse>>('/escorts', { params }),
        getMe: () => apiClient.get<ApiResponseWrapper<Escort>>('/escorts/me'),
        updateMe: (data: Partial<Escort>) => apiClient.put<ApiResponseWrapper<Escort>>('/escorts/me', data),
        getById: (id: string) => apiClient.get<ApiResponseWrapper<Escort>>(`/escorts/${id}`),
        view: (id: string) => apiClient.post(`/escorts/${id}/view`),
        getStats: (id: string) => apiClient.get<EscortStats>(`/escorts/${id}/stats`),
        getUnlocks: () => apiClient.get<string[]>('/escorts/me/unlocks'),
    },

    // DATING PROFILES
    datingProfiles: {
        getMe: () => apiClient.get<ApiResponseWrapper<DatingProfile>>('/dating-profiles/me'),
        updateMe: (data: DatingProfileUpdateData) =>
            apiClient.put<ApiResponseWrapper<DatingProfile>>('/dating-profiles/me', data),
        search: (params?: DatingSearchParams) =>
            apiClient.get<ApiResponseWrapper<DatingSearchResponse>>('/dating-profiles/search', { params }),
        getById: (id: string) => apiClient.get<ApiResponseWrapper<DatingProfile>>(`/dating-profiles/${id}`),
        view: (id: string) => apiClient.post(`/dating-profiles/${id}/view`),
        getStats: (id: string) => apiClient.get(`/dating-profiles/${id}/stats`),
        // Like/Match endpoints
        like: (profileId: string) => apiClient.post<ApiResponseWrapper<{ matched: boolean }>>(`/dating-profiles/${profileId}/like`),
        unlike: (profileId: string) => apiClient.delete(`/dating-profiles/${profileId}/like`),
        getLikeStatus: (profileId: string) => apiClient.get<ApiResponseWrapper<{ liked: boolean; matched: boolean }>>(`/dating-profiles/${profileId}/like-status`),
        getMatches: () => apiClient.get<ApiResponseWrapper<DatingProfile[]>>('/dating-profiles/matches'),
        getLikes: () => apiClient.get<ApiResponseWrapper<DatingProfile[]>>('/dating-profiles/likes'),
        getLikedBy: () => apiClient.get<ApiResponseWrapper<DatingProfile[]>>('/dating-profiles/liked-by'),
        getSuggested: (params?: { limit?: number }) => apiClient.get<ApiResponseWrapper<DatingProfile[]>>('/dating-likes/suggested', { params }),
    },

    // HOOKUP PROFILES
    hookupProfiles: {
        getMe: () => apiClient.get<ApiResponseWrapper<HookupProfile>>('/hookup-profiles/me'),
        updateMe: (data: HookupProfileUpdateData) =>
            apiClient.put<ApiResponseWrapper<HookupProfile>>('/hookup-profiles/me', data),
        getSavedEscorts: () => apiClient.get<ApiResponseWrapper<Escort[]>>('/hookup-profiles/saved-escorts'),
        saveEscort: (escortId: string) =>
            apiClient.post<ApiResponseWrapper<{ message: string }>>(`/hookup-profiles/saved-escorts/${escortId}`),
        removeSavedEscort: (escortId: string) =>
            apiClient.delete<ApiResponseWrapper<{ message: string }>>(`/hookup-profiles/saved-escorts/${escortId}`),
    },

    // PAYMENTS
    payments: {
        // Subscribe to dating (KES 300/year) - free access to all escort contacts
        subscribeDating: (phone: string) =>
            apiClient.post<ApiResponseWrapper<PaymentInitiateResponse>>('/pay/subscribe', { phone }),
        // Unlock escort contact (KES 150)
        unlockEscort: (escortId: string, phone: string) =>
            apiClient.post<ApiResponseWrapper<PaymentInitiateResponse>>('/pay/unlock', { phone, escortId }),
        // Subscribe to VIP (KES 3,000/year) - for ESCORTs only
        subscribeVIP: (phone: string) =>
            apiClient.post<ApiResponseWrapper<PaymentInitiateResponse>>('/pay/vip', { phone }),
        // Check payment status
        getPaymentStatus: (paymentId: string) =>
            apiClient.get<ApiResponseWrapper<PaymentStatus>>(`/payments/${paymentId}`),
        // M-Pesa callback webhook (internal use)
        mpesaCallback: (data: any) =>
            apiClient.post('/mpesa/callback', data),
    },

    // REFERRALS
    referrals: {
        getMyCode: () => apiClient.get<ReferralCodeResponse>('/referral/code'),
        applyCode: (code: string) => apiClient.post<ReferralApplyResponse>('/referral/apply', { code }),
        getMyReferrals: () => apiClient.get<MyReferralsResponse>('/referral/my-referrals'),
    },

    // WALLET
    wallet: {
        getSummary: () => apiClient.get<WalletSummary>('/wallet'),
        getTransactions: (params?: { page?: number; limit?: number }) =>
            apiClient.get<WalletTransactionsResponse>('/wallet/transactions', { params }),
        withdraw: (data: WithdrawRequest) =>
            apiClient.post<WithdrawResponse>('/wallet/withdraw', data),
    },

    // ACCESS (Token-based access for anonymous escort contact viewing)
    access: {
        getEscortByToken: (token: string) =>
            apiClient.get<AccessTokenResponse>(`/access/${token}`),
    },

    // REVIEWS
    reviews: {
        getEscortReviews: (escortId: string, params?: ReviewParams) =>
            apiClient.get<Review[]>(`/escorts/${escortId}/reviews`, { params }),
        createEscortReview: (escortId: string, data: Omit<CreateReview, 'targetId' | 'targetType'>) =>
            apiClient.post<Review>(`/escorts/${escortId}/reviews`, data),
        getDatingReviews: (profileId: string, params?: ReviewParams) =>
            apiClient.get<Review[]>(`/dating-profiles/${profileId}/reviews`, { params }),
        createDatingReview: (profileId: string, data: Omit<CreateReview, 'targetId' | 'targetType'>) =>
            apiClient.post<Review>(`/dating-profiles/${profileId}/reviews`, data),
        updateReview: (reviewId: string, data: Partial<CreateReview>) =>
            apiClient.put<Review>(`/reviews/${reviewId}`, data),
        deleteReview: (reviewId: string) =>
            apiClient.delete(`/reviews/${reviewId}`),
    },

    // CHAT
    chat: {
        getConversations: () => apiClient.get('/chat/conversations'),
        startConversation: (recipientId: string) => apiClient.post(`/chat/conversations/${recipientId}`),
        getMessages: (conversationId: string, params?: { page?: number; limit?: number }) =>
            apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }),
        markAsRead: (conversationId: string) => apiClient.post(`/chat/conversations/${conversationId}/read`),
        checkAccess: (userId: string) => apiClient.get(`/chat/check-access/${userId}`),
    },

    // UPLOADS (Cloudinary)
    uploads: {
        // Upload single image
        uploadImage: (file: File, folder: UploadFolder = 'general') => {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('folder', folder)
            return apiClient.post<UploadResponse>('/uploads/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        },

        // Upload multiple images (up to 10)
        uploadImages: (files: File[], folder: UploadFolder = 'general') => {
            const formData = new FormData()
            files.forEach((file) => formData.append('images', file))
            formData.append('folder', folder)
            return apiClient.post<MultiUploadResponse>('/uploads/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        },

        // Delete single image
        deleteImage: (publicId: string) =>
            apiClient.delete<DeleteImageResponse>('/uploads/image', { data: { publicId } }),

        // Delete multiple images
        deleteImages: (publicIds: string[]) =>
            apiClient.delete<DeleteImagesResponse>('/uploads/images', { data: { publicIds } }),
    },
}

export default ButicalAPI
export { TokenService }
// lib/config.ts

export const config = {
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lovebiteglobal.com/api/v1',
        // WebSocket URL - typically the base server URL without the API path
        wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'https://api.lovebiteglobal.com',
    },
    app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Butical',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    mpesa: {
        shortcode: process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '',
        passkey: process.env.NEXT_PUBLIC_MPESA_PASSKEY || '',
    },
    features: {
        enableReviews: process.env.NEXT_PUBLIC_ENABLE_REVIEWS === 'true',
        enableWallet: process.env.NEXT_PUBLIC_ENABLE_WALLET === 'true',
        enableReferrals: process.env.NEXT_PUBLIC_ENABLE_REFERRALS === 'true',
    },
    rateLimit: {
        requests: 100,
        window: '15 minutes',
    },
} as const;

export default config;
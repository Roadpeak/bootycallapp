// lib/utils/image.ts

/**
 * Processes an image URL from the API to ensure it's displayable
 * - If it's a full URL (http/https), return as-is
 * - If it's base64 without prefix, add the data:image prefix
 * - If it's already a data URL, return as-is
 */
export function getImageUrl(url: string | undefined | null): string {
    if (!url) {
        return 'https://via.placeholder.com/300x400'
    }

    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    // If it's already a data URL, return it
    if (url.startsWith('data:')) {
        return url
    }

    // If it looks like base64 data, add the prefix
    // Base64 strings are typically long and contain alphanumeric + / and =
    if (url.length > 50 && /^[A-Za-z0-9+/=]+$/.test(url.substring(0, 50))) {
        return `data:image/jpeg;base64,${url}`
    }

    // If it's a path, construct full URL from API base
    if (url.startsWith('/')) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://165.227.22.118/api/v1'
        const baseWithoutApi = apiBase.replace('/api/v1', '')
        return `${baseWithoutApi}${url}`
    }

    // Default: return as-is
    return url
}

/**
 * Process an array of image URLs
 */
export function getImageUrls(urls: string[] | undefined | null): string[] {
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return ['https://via.placeholder.com/300x400']
    }

    return urls.map(getImageUrl)
}

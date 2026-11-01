// lib/utils/share.ts

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/**
 * Shares a link with the phone's share sheet where there is one, and copies
 * it to the clipboard everywhere else (most desktop browsers).
 */
export async function shareLink(data: { url: string; title?: string; text?: string }): Promise<ShareResult> {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
            await navigator.share(data)
            return 'shared'
        } catch (err) {
            // Closing the share sheet is not an error worth reporting
            if ((err as DOMException)?.name === 'AbortError') return 'cancelled'
        }
    }
    return (await copyText(data.url)) ? 'copied' : 'failed'
}

/** Copies text, falling back to a hidden textarea where the Clipboard API is unavailable. */
export async function copyText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch {
        // fall through to the textarea method
    }
    try {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(area)
        return ok
    } catch {
        return false
    }
}

/** The public link to an escort's profile. */
export function escortProfileUrl(escortId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lovebiteglobal.com'
    return `${origin}/escorts/${escortId}`
}

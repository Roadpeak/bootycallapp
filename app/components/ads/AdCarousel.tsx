'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, MessageCircle, Phone } from 'lucide-react'
import ButicalAPI from '@/services/butical-api-service'
import type { Advertisement } from '@/services/butical-api-service'
import { getImageUrl } from '@/lib/utils/image'

/** How long a slide stays up before advancing, in ms. */
const AUTOPLAY_MS = 6000

const ACTION_META = {
  LINK: { label: 'Click Now', Icon: ExternalLink, className: 'bg-rose-500 hover:bg-rose-600' },
  WHATSAPP: {
    label: 'Chat on WhatsApp',
    Icon: MessageCircle,
    className: 'bg-emerald-500 hover:bg-emerald-600',
  },
  CALL: { label: 'Call Now', Icon: Phone, className: 'bg-blue-500 hover:bg-blue-600' },
} as const

/** Turns a stored destination into something the browser can open. */
function destinationFor(ad: Advertisement): string {
  switch (ad.actionType) {
        case 'WHATSAPP':
            return `https://wa.me/${ad.actionValue}`
        case 'CALL':
            return `tel:+${ad.actionValue}`
        default:
            return ad.actionValue
    }
}

/**
 * Sliding promotional cards shown under the locations row on the escort
 * browsing page. Renders nothing when there are no active ads, so the page
 * looks unchanged rather than showing an empty frame.
 */
export default function AdCarousel({ className = '' }: { className?: string }) {
    const [ads, setAds] = useState<Advertisement[]>([])
    const [index, setIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const impressionsSent = useRef(false)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const response = await ButicalAPI.ads.list()
                const data = (response.data as any)?.data || response.data || []
                if (!cancelled && Array.isArray(data)) setAds(data)
            } catch {
                // Ads are decoration. A failure here must never take the
                // browsing page down with it.
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [])

    // One impression per ad per page view, counted once the ads are known.
    useEffect(() => {
        if (!ads.length || impressionsSent.current) return
        impressionsSent.current = true

        ButicalAPI.ads.recordImpressions(ads.map((ad) => ad.id)).catch(() => {
            // Counting is best-effort; losing one is not worth surfacing.
        })
    }, [ads])

    const go = useCallback(
        (next: number) => {
            if (!ads.length) return
            // Wrap in both directions so the arrows never dead-end.
            setIndex(((next % ads.length) + ads.length) % ads.length)
        },
        [ads.length],
    )

    useEffect(() => {
        if (ads.length < 2 || isPaused) return

        const timer = setInterval(() => setIndex((i) => (i + 1) % ads.length), AUTOPLAY_MS)
        return () => clearInterval(timer)
    }, [ads.length, isPaused])

    const handleClick = async (ad: Advertisement) => {
        const destination = destinationFor(ad)

        // Open first, then record. Waiting on the tracking call risks the
        // popup blocker treating the navigation as un-triggered by the user.
        if (ad.actionType === 'CALL') {
            window.location.href = destination
        } else {
            window.open(destination, '_blank', 'noopener,noreferrer')
        }

        try {
            await ButicalAPI.ads.trackClick(ad.id)
        } catch {
            // The user already reached the destination; a failed count is not
            // worth interrupting them for.
        }
    }

    if (!ads.length) return null

    const current = ads[index]
    const meta = ACTION_META[current.actionType] ?? ACTION_META.LINK
    const { Icon } = meta

    return (
        <section
            className={`relative ${className}`}
            aria-label="Sponsored"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative overflow-hidden rounded-xl bg-gray-800">
                <div className="flex flex-col sm:flex-row">
                    <div className="relative h-40 w-full flex-shrink-0 sm:h-auto sm:w-64">
                        <img
                            src={getImageUrl(current.imageUrl)}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90">
                            Ad
                        </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-center gap-2 p-4 sm:p-5">
                        <h3 className="text-lg font-bold text-white">{current.name}</h3>
                        {current.detail && (
                            <p className="line-clamp-2 text-sm text-gray-300">{current.detail}</p>
                        )}

                        <button
                            onClick={() => handleClick(current)}
                            className={`mt-1 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${meta.className}`}
                        >
                            <Icon className="h-4 w-4" />
                            {current.actionLabel || meta.label}
                        </button>
                    </div>
                </div>

                {ads.length > 1 && (
                    <>
                        <button
                            onClick={() => go(index - 1)}
                            aria-label="Previous ad"
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => go(index + 1)}
                            aria-label="Next ad"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>

            {ads.length > 1 && (
                <div className="mt-2 flex justify-center gap-1.5">
                    {ads.map((ad, i) => (
                        <button
                            key={ad.id}
                            onClick={() => go(i)}
                            aria-label={`Go to ad ${i + 1}`}
                            aria-current={i === index}
                            className={`h-1.5 rounded-full transition-all ${
                                i === index ? 'w-5 bg-rose-500' : 'w-1.5 bg-gray-600 hover:bg-gray-500'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

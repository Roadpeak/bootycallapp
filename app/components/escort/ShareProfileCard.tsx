// app/components/escort/ShareProfileCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { Copy, Share2, Check } from 'lucide-react'
import { copyText, escortProfileUrl, shareLink } from '@/lib/utils/share'

/**
 * The escort's public profile link, with copy, share and WhatsApp, so they
 * can send clients straight to their profile.
 */
export default function ShareProfileCard({ escortId, name }: { escortId: string; name: string }) {
    const [url, setUrl] = useState('')
    const [note, setNote] = useState<string | null>(null)

    // window is only available after mount
    useEffect(() => setUrl(escortProfileUrl(escortId)), [escortId])

    const flash = (message: string) => {
        setNote(message)
        setTimeout(() => setNote(null), 2500)
    }

    const copy = async () => flash((await copyText(url)) ? 'Link copied' : "Couldn't copy. Select the link and copy it.")

    const share = async () => {
        const result = await shareLink({ url, title: `${name} on LoveBite`, text: `Book ${name} on LoveBite` })
        if (result === 'copied') flash('Link copied')
        else if (result === 'failed') flash("Couldn't share. Select the link and copy it.")
    }

    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Book ${name} on LoveBite: ${url}`)}`

    return (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Share your profile</h2>
            <p className="mt-1 text-sm text-gray-600">Send this link to clients so they can see your profile and contact you.</p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                    readOnly
                    value={url}
                    aria-label="Your profile link"
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={copy}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
                    >
                        {note === 'Link copied' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        Copy
                    </button>
                    <button
                        type="button"
                        onClick={share}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 sm:flex-none"
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </button>
                </div>
            </div>

            <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-green-700 hover:underline"
            >
                Share on WhatsApp
            </a>
            {note && <p role="status" className="mt-2 text-sm text-gray-600">{note}</p>}
        </div>
    )
}

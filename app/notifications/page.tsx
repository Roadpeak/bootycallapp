'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, ChevronRight, Loader2 } from 'lucide-react'
import ButicalAPI, { TokenService, type AppNotification } from '@/services/butical-api-service'

/** Everything admins have sent to this member, newest first. */
export default function NotificationsPage() {
    const router = useRouter()
    const [items, setItems] = useState<AppNotification[]>([])
    const [unread, setUnread] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async (p: number) => {
        setLoading(true)
        try {
            const res = await ButicalAPI.notifications.list(p, 20)
            const body = res.data as any
            setItems((prev) => (p === 1 ? body.data ?? [] : [...prev, ...(body.data ?? [])]))
            setUnread(body.unread ?? 0)
            setTotalPages(body.pagination?.totalPages ?? 1)
            setError(null)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Could not load notifications.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!TokenService.getAccessToken()) {
            router.push('/auth/login')
            return
        }
        load(1)
    }, [load, router])

    async function open(n: AppNotification) {
        if (!n.read) {
            setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
            setUnread((c) => Math.max(0, c - 1))
            ButicalAPI.notifications.markRead(n.id).catch(() => undefined)
        }
        if (n.link) router.push(n.link)
    }

    async function markAll() {
        setItems((list) => list.map((x) => ({ ...x, read: true })))
        setUnread(0)
        await ButicalAPI.notifications.markAllRead().catch(() => undefined)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div className="max-w-2xl mx-auto px-4 pt-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">{unread > 0 ? `${unread} unread` : 'You are all caught up'}</p>
                    </div>
                    {unread > 0 && (
                        <button type="button" onClick={markAll} className="inline-flex items-center gap-1.5 text-sm font-medium text-pink-600 hover:text-pink-700">
                            <CheckCheck className="w-4 h-4" /> Mark all read
                        </button>
                    )}
                </div>

                {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                {loading && items.length === 0 ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white animate-pulse" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl bg-white border border-gray-200 py-16 text-center">
                        <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No notifications yet</p>
                        <p className="text-sm text-gray-500 mt-1">News and offers from LoveBite will show up here.</p>
                        <Link href="/" className="inline-block mt-4 text-sm text-pink-600 font-medium">Back home</Link>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {items.map((n) => (
                            <li key={n.id}>
                                <button
                                    type="button"
                                    onClick={() => open(n)}
                                    className={`w-full text-left rounded-xl border p-4 flex gap-3 transition-colors ${n.read ? 'bg-white border-gray-200' : 'bg-pink-50 border-pink-200'} ${n.link ? 'hover:border-pink-300' : 'cursor-default'}`}
                                >
                                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-pink-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900">{n.title}</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-line mt-0.5">{n.body}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(n.createdAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {n.link && <ChevronRight className="w-5 h-5 text-gray-400 self-center" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {page < totalPages && (
                    <div className="text-center mt-6">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => { const next = page + 1; setPage(next); load(next) }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Load more
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

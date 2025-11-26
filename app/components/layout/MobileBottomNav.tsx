'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Heart, Gift } from 'lucide-react'

interface NavItem {
    href: string
    icon: React.ReactNode
    label: string
    badge?: number
}

interface MobileBottomNavProps {
    matchCount?: number
    messageCount?: number
}

export default function MobileBottomNav({ matchCount = 0, messageCount = 0 }: MobileBottomNavProps) {
    const pathname = usePathname()

    const navItems: NavItem[] = [
        {
            href: '/dating',
            icon: <Home className="w-6 h-6" />,
            label: 'Home'
        },
        {
            href: '/chat',
            icon: <MessageCircle className="w-6 h-6" />,
            label: 'Messages',
            badge: messageCount
        },
        {
            href: '/dating?view=matches',
            icon: <Heart className="w-6 h-6" />,
            label: 'Matches',
            badge: matchCount
        },
        {
            href: '/referral',
            icon: <Gift className="w-6 h-6" />,
            label: 'Referral'
        }
    ]

    const isActive = (href: string) => {
        if (href === '/dating') {
            const hasMatchesQuery = typeof window !== 'undefined' && window.location.search.includes('view=matches')
            return pathname === '/dating' && !hasMatchesQuery
        }
        if (href === '/dating?view=matches') {
            const hasMatchesQuery = typeof window !== 'undefined' && window.location.search.includes('view=matches')
            return pathname === '/dating' && hasMatchesQuery
        }
        return pathname === href || pathname?.startsWith(href + '/')
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                active
                                    ? 'text-pink-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="relative w-6 h-6 flex items-center justify-center mb-1">
                                {item.icon}
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold leading-none">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

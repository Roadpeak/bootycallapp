'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, MessageCircle, Heart, Gift } from 'lucide-react'

interface MobileBottomNavProps {
    matchCount?: number
    messageCount?: number
}

export default function MobileBottomNav({ matchCount = 0, messageCount = 0 }: MobileBottomNavProps) {
    const pathname = usePathname()

    const navItems = [
        { href: '/dating', icon: Home, label: 'Home', badge: 0 },
        { href: '/chat', icon: MessageCircle, label: 'Messages', badge: messageCount },
        { href: '/dating?view=matches', icon: Heart, label: 'Matches', badge: matchCount },
        { href: '/referral', icon: Gift, label: 'Referral', badge: 0 },
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
        <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 safe-area-inset-bottom">
            {/* Frosted glass background */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 shadow-2xl shadow-gray-900/10" />

            <div className="relative flex justify-around items-center h-[62px] px-2">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 h-full"
                        >
                            <motion.div
                                className="flex flex-col items-center gap-0.5"
                                whileTap={{ scale: 0.85 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                {/* Icon container */}
                                <div className="relative">
                                    <motion.div
                                        className={`p-2 rounded-xl transition-all duration-200 ${active
                                            ? 'bg-gradient-to-br from-pink-500 to-rose-500 shadow-md shadow-pink-500/30'
                                            : 'bg-transparent'
                                            }`}
                                        animate={active ? { scale: 1.1 } : { scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Icon
                                            className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-400'}`}
                                        />
                                    </motion.div>

                                    {/* Badge */}
                                    {item.badge > 0 && (
                                        <motion.span
                                            className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[9px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold leading-none border border-white"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        >
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </motion.span>
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-pink-600' : 'text-gray-400'}`}>
                                    {item.label}
                                </span>
                            </motion.div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

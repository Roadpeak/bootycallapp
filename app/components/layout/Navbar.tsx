// components/Navbar.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Heart,
    MessageCircle,
    Bell,
    User,
    ChevronDown,
    Menu,
    X,
    HelpCircle,
    Settings,
    LogOut,
    Sparkles,
    Phone,
    Clock,
    MessageSquare,
    Instagram,
    Facebook,
    Twitter,
    Gift,
    DollarSign,
    Send
} from 'lucide-react'
import ButicalAPI, { TokenService } from '@/services/butical-api-service'
import type { User as UserType, WalletSummary, ReferralCode } from '@/services/butical-api-service'

interface NavbarProps {
    forceLoggedIn?: boolean // For testing purposes
}

const Navbar: React.FC<NavbarProps> = ({ forceLoggedIn }) => {
    const router = useRouter()
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [referralMenuOpen, setReferralMenuOpen] = useState(false)

    // User state
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Referral stats
    const [referralStats, setReferralStats] = useState({
        balance: 0,
        referralCount: 0
    })

    // Notifications from API
    const [notifications, setNotifications] = useState<any[]>([])

    // Check authentication and fetch user data
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = TokenService.getAccessToken()
                console.log('Navbar: Checking auth, token exists:', !!token)

                if (token || forceLoggedIn) {
                    setIsLoggedIn(true)

                    // Try to fetch user data
                    try {
                        const userResponse = await ButicalAPI.users.getMe()
                        // API returns { status, data: User }
                        const userData = userResponse.data?.data || userResponse.data
                        console.log('Navbar: User data fetched:', userData)
                        setUser(userData)

                        // Fetch referral stats if user is logged in
                        fetchReferralStats()
                    } catch (userError: any) {
                        console.warn('Navbar: Failed to fetch user data:', userError)
                        console.warn('Navbar: Error details:', {
                            status: userError.response?.status,
                            data: userError.response?.data,
                            message: userError.message
                        })

                        // Don't immediately clear tokens on 401 - the interceptor will handle token refresh
                        // Only clear tokens if refresh has already failed (indicated by being redirected to login)
                        // For now, just keep the logged in state and try again on next navigation
                        console.log('Navbar: Keeping logged in state despite error')
                    }
                } else {
                    setIsLoggedIn(false)
                    setUser(null)
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                setIsLoggedIn(false)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [forceLoggedIn])

    // Fetch referral stats
    const fetchReferralStats = async () => {
        try {
            const [walletResponse, referralsResponse] = await Promise.all([
                ButicalAPI.wallet.getSummary(),
                ButicalAPI.referrals.getMyReferrals()
            ])

            // Unwrap API responses: { status, data: { ... } }
            const walletData = (walletResponse.data as any)?.data || walletResponse.data
            const referralsData = (referralsResponse.data as any)?.data || referralsResponse.data

            setReferralStats({
                balance: walletData.currentBalance || walletData.balance || 0,
                referralCount: referralsData.totalCount || referralsData.referrals?.length || 0
            })
        } catch (error) {
            console.error('Failed to fetch referral stats:', error)
        }
    }

    // Handle scroll event to change navbar appearance
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdown menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            const isOutsideClick =
                !target.closest('.dropdown-menu') &&
                !target.closest('.dropdown-toggle')

            if (isOutsideClick) {
                setNotificationsOpen(false)
                setProfileMenuOpen(false)
                setReferralMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle logout
    const handleLogout = async () => {
        try {
            await ButicalAPI.auth.logout()
            setIsLoggedIn(false)
            setUser(null)
            setProfileMenuOpen(false)
            setMobileMenuOpen(false)
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
            // Still clear tokens and redirect even if API call fails
            TokenService.clearTokens()
            setIsLoggedIn(false)
            setUser(null)
            router.push('/')
        }
    }

    // Get user display name
    const getUserDisplayName = () => {
        if (!user) return 'User'
        return user.displayName || user.firstName || 'User'
    }

    // Get user email
    const getUserEmail = () => {
        return user?.email || 'user@example.com'
    }

    // Get profile link based on user role
    const getProfileLink = () => {
        if (!user) return '/profile'

        switch (user.role) {
            case 'DATING_USER':
                return '/profile/dating'
            case 'ESCORT':
                return '/profile/escort'
            case 'HOOKUP_USER':
                return '/profile/hookup'
            default:
                return '/profile'
        }
    }

    // Don't show navbar on auth pages
    if (pathname?.startsWith('/auth/')) {
        return null
    }

    if (isLoading) {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 py-4 bg-white/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 text-transparent bg-clip-text">
                                LoveBite
                            </span>
                        </Link>
                        <div className="animate-pulse flex space-x-4">
                            <div className="h-8 w-20 bg-gray-200 rounded"></div>
                            <div className="h-8 w-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <>
            {/* Top Info Bar - Mobile & Desktop */}
            <div className="bg-gray-900/95 fixed top-0 left-0 right-0 z-50 text-white text-xs border-b border-gray-800 py-1.5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Desktop View */}
                    <div className="hidden md:flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <a href="tel:+254745131915" className="flex items-center hover:text-pink-300 transition-colors">
                                <Phone className="w-3.5 h-3.5 mr-1.5" />
                                <span>+254 745 131 915</span>
                            </a>

                            <a
                                href="https://wa.me/254745131915"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-pink-300 transition-colors"
                            >
                                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                <span>WhatsApp Support</span>
                            </a>

                            <div className="flex items-center text-gray-400">
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                <span>24/7 Customer Support</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <a href="https://www.instagram.com/otter.3458179?igsh=MWNibmoyeXEwbzBjbw==" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                    <Instagram className="w-3.5 h-3.5" />
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61584251378179" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                    <Facebook className="w-3.5 h-3.5" />
                                </a>
                                <a href="https://x.com/LoveBiteGlobal?t=N-M-GhiFoWCkrUkZ_e7NXA&s=09" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                    <Twitter className="w-3.5 h-3.5" />
                                </a>
                                <a href="https://t.me/+hxnqx5tj6FNmY2U0" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                    <Send className="w-3.5 h-3.5" />
                                </a>
                                <a href="https://www.tiktok.com/@lovebiteglobal?_r=1&_t=ZM-91n1AOVYMJv" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                </a>
                            </div>

                            <div className="border-l border-gray-700 pl-4 flex items-center">
                                <span className="text-gray-400 mr-2">Need help?</span>
                                <a href="mailto:lovebiteglobalv2030@gmail.com" className="text-pink-400 hover:text-pink-300 transition-colors font-medium">
                                    Contact us
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Mobile View - WhatsApp and Socials */}
                    <div className="md:hidden flex justify-between items-center">
                        <a
                            href="https://wa.me/254745131915"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-pink-300 transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            <span>WhatsApp Support</span>
                        </a>

                        <div className="flex items-center space-x-3">
                            <a href="https://www.instagram.com/otter.3458179?igsh=MWNibmoyeXEwbzBjbw==" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                <Instagram className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61584251378179" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                <Facebook className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://x.com/LoveBiteGlobal?t=N-M-GhiFoWCkrUkZ_e7NXA&s=09" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                <Twitter className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://t.me/+hxnqx5tj6FNmY2U0" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                <Send className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://www.tiktok.com/@lovebiteglobal?_r=1&_t=ZM-91n1AOVYMJv" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className={`fixed top-[28px] left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 bg-white shadow-md' : 'py-4 bg-white/95 backdrop-blur-sm'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 text-transparent bg-clip-text">
                        LoveBite
                    </span>
                </Link>

                {/* Main Nav Links */}
                <div className="hidden md:flex space-x-8">
                    <Link href="/escorts" className="text-gray-600 hover:text-pink-600 transition-colors">
                        Hookups
                    </Link>
                    <Link href="/dating" className="text-gray-600 hover:text-pink-600 transition-colors">
                        Dating
                    </Link>

                    {isLoggedIn && (
                        <>
                            <Link href="/chat" className="text-gray-600 hover:text-pink-600 transition-colors">
                                Messages
                            </Link>

                            {/* Referrals dropdown */}
                            <div className="relative">
                                <button
                                    className="dropdown-toggle flex items-center text-gray-600 hover:text-pink-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setReferralMenuOpen(!referralMenuOpen)
                                        setNotificationsOpen(false)
                                        setProfileMenuOpen(false)
                                    }}
                                >
                                    <Gift className="mr-1 w-4 h-4 text-pink-500" />
                                    <span>Referrals</span>
                                    <ChevronDown className="ml-1 w-3.5 h-3.5" />
                                </button>

                                {referralMenuOpen && (
                                    <div
                                        className="dropdown-menu absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-pink-100 py-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="px-4 py-3 border-b border-pink-100">
                                            <p className="text-sm font-medium text-gray-900">Referral Balance</p>
                                            <p className="text-lg font-bold text-pink-600 mt-1">
                                                KSh {referralStats.balance.toLocaleString()}
                                            </p>
                                        </div>

                                        <Link
                                            href="/referral"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                            onClick={() => setReferralMenuOpen(false)}
                                        >
                                            <Gift className="mr-3 w-4 h-4 text-pink-500" />
                                            <span>Referral Dashboard</span>
                                        </Link>
                                        <Link
                                            href="/referral/wallet"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                            onClick={() => setReferralMenuOpen(false)}
                                        >
                                            <DollarSign className="mr-3 w-4 h-4 text-green-500" />
                                            <span>Wallet</span>
                                        </Link>
                                        <Link
                                            href="/referral/cashout"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                            onClick={() => setReferralMenuOpen(false)}
                                        >
                                            <DollarSign className="mr-3 w-4 h-4 text-green-500" />
                                            <span>Cashout</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center">
                {isLoggedIn ? (
                    <>
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                className="dropdown-toggle p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all relative"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setNotificationsOpen(!notificationsOpen)
                                    setProfileMenuOpen(false)
                                    setReferralMenuOpen(false)
                                }}
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.some(n => n.unread) && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <div
                                    className="dropdown-menu fixed md:absolute right-4 md:right-0 left-4 md:left-auto mt-1 w-auto md:w-80 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-4 py-2 border-b border-pink-100 flex justify-between items-center">
                                        <h3 className="font-medium text-gray-900">Notifications</h3>
                                        <Link
                                            href="/notifications"
                                            className="text-xs text-pink-600 hover:text-pink-700"
                                            onClick={() => setNotificationsOpen(false)}
                                        >
                                            View All
                                        </Link>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-4 py-3 flex items-start hover:bg-pink-50 transition-colors ${notification.unread ? 'bg-pink-50/50' : ''
                                                        }`}
                                                >
                                                    <img
                                                        src={notification.image}
                                                        alt="User"
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-900">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                    {notification.type === 'like' && (
                                                        <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                                                    )}
                                                    {notification.type === 'message' && (
                                                        <MessageCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    )}
                                                    {notification.type === 'match' && (
                                                        <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-8 text-center text-gray-500">
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User profile menu */}
                        <div className="relative ml-2">
                            <button
                                className="dropdown-toggle relative ml-2 flex items-center"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setProfileMenuOpen(!profileMenuOpen)
                                    setNotificationsOpen(false)
                                    setReferralMenuOpen(false)
                                }}
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-colors bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            </button>

                            {profileMenuOpen && (
                                <div
                                    className="dropdown-menu absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-pink-100 py-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-4 py-3 border-b border-pink-100">
                                        <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{getUserEmail()}</p>
                                    </div>

                                    <Link
                                        href={getProfileLink()}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        <User className="mr-3 w-4 h-4 text-pink-500" />
                                        <span>View Profile</span>
                                    </Link>
                                    <Link
                                        href="/referral"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        <Gift className="mr-3 w-4 h-4 text-pink-500" />
                                        <span>My Referrals</span>
                                    </Link>

                                    <div className="border-t border-pink-100 mt-1 pt-1">
                                        <button
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-3 w-4 h-4" />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/auth/login">
                                <button className="px-3 py-1.5 text-sm border border-pink-300 text-pink-700 rounded-xl hover:bg-pink-50 font-medium transition-colors">
                                    Log In
                                </button>
                            </Link>
                            <Link href="/auth/signup/dating" className="ml-3">
                                <button className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium transition-colors flex items-center">
                                    <Heart size={16} className="mr-2" />
                                    Sign Up Free
                                </button>
                            </Link>
                        </div>
                    </>
                )}

                {/* Mobile menu button */}
                <button
                    className="ml-4 md:hidden p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-pink-100 space-y-1">
                {isLoggedIn ? (
                    <>
                        <Link
                            href="/dating"
                            className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dating
                        </Link>
                        <Link
                            href="/escorts"
                            className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Hookups
                        </Link>
                        <Link
                            href="/chat"
                            className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Messages
                        </Link>

                        {/* Referral options in mobile menu */}
                        <div className="border-t border-pink-100 pt-2 mt-2">
                            <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Referral Program
                            </p>
                            <Link
                                href="/referral"
                                className="flex items-center px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Gift className="mr-3 w-5 h-5 text-pink-500" />
                                <span>Referral Dashboard</span>
                            </Link>
                            <Link
                                href="/referral/wallet"
                                className="flex items-center px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <DollarSign className="mr-3 w-5 h-5 text-green-500" />
                                <span>Wallet</span>
                            </Link>
                            <Link
                                href="/referral/cashout"
                                className="flex items-center px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <DollarSign className="mr-3 w-5 h-5 text-green-500" />
                                <span>Cashout (KSh {referralStats.balance.toLocaleString()})</span>
                            </Link>
                        </div>

                        <div className="pt-4 mt-4 border-t border-pink-100">
                            <button
                                className="flex w-full items-center px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-3 w-5 h-5" />
                                <span>Sign out</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link
                            href="/escorts"
                            className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Hookups
                        </Link>
                        <Link
                            href="/dating"
                            className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dating
                        </Link>
                        <div className="pt-4 mt-4 border-t border-pink-100 space-y-3">
                            <Link
                                href="/auth/login"
                                className="block"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <button className="w-full px-4 py-2 border border-pink-300 text-pink-700 rounded-xl hover:bg-pink-50 font-medium transition-colors">
                                    Log In
                                </button>
                            </Link>
                            <Link
                                href="/auth/signup/dating"
                                className="block"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <button className="w-full px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium transition-colors flex items-center justify-center">
                                    <Heart size={16} className="mr-2" />
                                    Sign Up Free
                                </button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        )}
    </div>
            </nav>
        </>
    )
}

export default Navbar
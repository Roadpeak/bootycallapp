'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Heart,
    MessageCircle,
    Search,
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
    DollarSign
} from 'lucide-react'

interface NavbarProps {
    isLoggedIn?: boolean
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false }) => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [referralMenuOpen, setReferralMenuOpen] = useState(false)

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

    // Sample notifications
    const notifications = [
        {
            id: 1,
            type: 'like',
            message: 'Jessica liked your profile',
            time: '2 mins ago',
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            unread: true
        },
        {
            id: 2,
            type: 'message',
            message: 'New message from Michael',
            time: '1 hour ago',
            image: 'https://randomuser.me/api/portraits/men/86.jpg',
            unread: true
        },
        {
            id: 3,
            type: 'match',
            message: 'You matched with Sarah!',
            time: '3 hours ago',
            image: 'https://randomuser.me/api/portraits/women/24.jpg',
            unread: false
        }
    ]

    // Sample referral stats
    const referralStats = {
        balance: 1250,
        referralCount: 12
    }

    return (
        <>
            {/* Top Info Bar - Desktop Only */}
            <div className="bg-gray-900/95 fixed top-0 left-0 right-0 z-50 text-white text-xs border-b border-gray-800 py-1.5 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <a href="tel:+254712345678" className="flex items-center hover:text-pink-300 transition-colors">
                                <Phone className="w-3.5 h-3.5 mr-1.5" />
                                <span>+254 712 345 678</span>
                            </a>

                            <a
                                href="https://wa.me/254712345678"
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
                                <a href="#" className="hover:text-pink-300 transition-colors">
                                    <Instagram className="w-3.5 h-3.5" />
                                </a>
                                <a href="#" className="hover:text-pink-300 transition-colors">
                                    <Facebook className="w-3.5 h-3.5" />
                                </a>
                                <a href="#" className="hover:text-pink-300 transition-colors">
                                    <Twitter className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            <div className="border-l border-gray-700 pl-4 flex items-center">
                                <span className="text-gray-400 mr-2">Need help?</span>
                                <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors font-medium">
                                    Contact us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className={`fixed top-0 md:top-[28px] left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 bg-white shadow-md' : 'py-4 bg-white/95 backdrop-blur-sm'}`}>
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
                                    BootyCall
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
                                                        <p className="text-lg font-bold text-pink-600 mt-1">KSh {referralStats.balance}</p>
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
                                    {/* Search button */}
                                    <button className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all">
                                        <Search className="w-5 h-5" />
                                    </button>

                                    {/* Notifications */}
                                    <div className="relative ml-2">
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
                                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
                                        </button>

                                        {notificationsOpen && (
                                            <div
                                                className="dropdown-menu absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-pink-100 py-2"
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
                                                    {notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`px-4 py-3 flex items-start hover:bg-pink-50 transition-colors ${notification.unread ? 'bg-pink-50/50' : ''}`}
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
                                                    ))}
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
                                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-colors">
                                                <img
                                                    src="https://randomuser.me/api/portraits/men/32.jpg"
                                                    alt="Your profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </button>

                                        {profileMenuOpen && (
                                            <div
                                                className="dropdown-menu absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-pink-100 py-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="px-4 py-3 border-b border-pink-100">
                                                    <p className="text-sm font-medium text-gray-900">Alex Rodriguez</p>
                                                    <p className="text-xs text-gray-500 mt-1">alex.rodriguez@example.com</p>
                                                </div>

                                                <Link
                                                    href="/profile/dating"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <User className="mr-3 w-4 h-4 text-pink-500" />
                                                    <span>View Profile</span>
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <Settings className="mr-3 w-4 h-4 text-gray-500" />
                                                    <span>Settings</span>
                                                </Link>
                                                <Link
                                                    href="/referral"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <Gift className="mr-3 w-4 h-4 text-pink-500" />
                                                    <span>My Referrals</span>
                                                </Link>
                                                <Link
                                                    href="/help"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <HelpCircle className="mr-3 w-4 h-4 text-gray-500" />
                                                    <span>Help & Support</span>
                                                </Link>

                                                <div className="border-t border-pink-100 mt-1 pt-1">
                                                    <button
                                                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            // Handle logout
                                                            setProfileMenuOpen(false)
                                                        }}
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
                                            <span>Cashout (KSh {referralStats.balance})</span>
                                        </Link>
                                    </div>

                                    <Link
                                        href="/settings"
                                        className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-pink-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Settings
                                    </Link>
                                    <div className="pt-4 mt-4 border-t border-pink-100">
                                        <button
                                            className="flex w-full items-center px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                                            onClick={() => setMobileMenuOpen(false)}
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
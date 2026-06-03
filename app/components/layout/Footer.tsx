'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const quickLinks = [
        { href: '/dating', label: 'Dating' },
        { href: '/escorts', label: 'Escorts' },
        { href: '/auth/signup/escort', label: 'Become an Escort' },
        { href: '/referral', label: 'Referral Program' },
        { href: '/legal/about', label: 'About Us' },
    ]

    const legalLinks = [
        { href: '/legal/terms', label: 'Terms & Conditions' },
        { href: '/legal/privacy', label: 'Privacy Policy' },
        { href: '/legal/refund', label: 'Refund Policy' },
        { href: '/legal/guidelines', label: 'Community Guidelines' },
        { href: '/legal/safety', label: 'Safety Tips' },
    ]

    const socials = [
        { href: 'https://www.instagram.com/otter.3458179?igsh=MWNibmoyeXEwbzBjbw==', icon: <Instagram className="w-4 h-4" />, label: 'Instagram' },
        { href: 'https://www.facebook.com/profile.php?id=61584251378179', icon: <Facebook className="w-4 h-4" />, label: 'Facebook' },
        { href: 'https://x.com/LoveBiteGlobal?t=N-M-GhiFoWCkrUkZ_e7NXA&s=09', icon: <Twitter className="w-4 h-4" />, label: 'Twitter' },
        { href: 'https://t.me/+hxnqx5tj6FNmY2U0', icon: <Send className="w-4 h-4" />, label: 'Telegram' },
        {
            href: 'https://www.tiktok.com/@lovebiteglobal?_r=1&_t=ZM-91n1AOVYMJv',
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>,
            label: 'TikTok'
        },
    ]

    return (
        <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-1 space-y-5">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                                <Heart className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">LoveBite</span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            Kenya's premier platform for dating and connections. Find your match or explore exciting encounters.
                        </p>

                        {/* Socials */}
                        <div className="flex items-center gap-2.5">
                            {socials.map((social) => (
                                <motion.a
                                    key={social.href}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 hover:bg-pink-500 hover:border-pink-500 flex items-center justify-center transition-all duration-200 text-gray-400 hover:text-white"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm tracking-wide">Quick Links</h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-500 hover:text-pink-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm tracking-wide">Legal</h3>
                        <ul className="space-y-2.5">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-500 hover:text-pink-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm tracking-wide">Contact Us</h3>
                        <ul className="space-y-3.5">
                            {[
                                { icon: <Phone className="w-4 h-4 text-pink-500 flex-shrink-0" />, primary: <a href="tel:+254745131915" className="text-sm text-gray-400 hover:text-pink-400 transition-colors">+254 745 131 915</a>, secondary: '24/7 Support' },
                                { icon: <Mail className="w-4 h-4 text-pink-500 flex-shrink-0" />, primary: <a href="mailto:lovebiteglobalv2030@gmail.com" className="text-sm text-gray-400 hover:text-pink-400 transition-colors truncate">lovebiteglobalv2030@gmail.com</a>, secondary: 'Email support' },
                                { icon: <Send className="w-4 h-4 text-pink-500 flex-shrink-0" />, primary: <a href="https://wa.me/254745131915" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-pink-400 transition-colors">WhatsApp Support</a>, secondary: 'Instant response' },
                                { icon: <MapPin className="w-4 h-4 text-pink-500 flex-shrink-0" />, primary: <span className="text-sm text-gray-400">Nairobi, Kenya</span>, secondary: 'Head Office' },
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5">{item.icon}</div>
                                    <div>
                                        {item.primary}
                                        <p className="text-xs text-gray-600 mt-0.5">{item.secondary}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Payment + Trust */}
                <div className="mt-12 pt-8 border-t border-gray-900">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-gray-600 font-medium">We Accept:</p>
                            <div className="bg-white rounded-lg px-3 py-1.5 flex items-center">
                                <span className="text-green-600 font-bold text-sm">M-PESA</span>
                            </div>
                            <span className="text-xs text-gray-700">Powered by Safaricom</span>
                        </div>
                        <div className="flex items-center gap-5 text-xs text-gray-600">
                            <span>18+ only</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full" />
                            <span>All transactions encrypted</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-2">
                    <p className="text-xs text-gray-600">© {currentYear} LoveBite. All rights reserved.</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                        Made with <Heart className="w-3 h-3 text-pink-500 fill-pink-500 mx-0.5" /> in Kenya
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer

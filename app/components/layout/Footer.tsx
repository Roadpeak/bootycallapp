'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4 col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center">
                            <img
                                src="/images/lovebitelogo.png"
                                alt="LoveBite Logo"
                                className="w-32 h-auto"
                            />
                        </Link>
                        <p className="text-sm text-gray-400">
                            Kenya's premier platform for dating and connections. Find your match or explore exciting encounters.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-500 flex items-center justify-center transition-colors"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-500 flex items-center justify-center transition-colors"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-500 flex items-center justify-center transition-colors"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-500 flex items-center justify-center transition-colors"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm lg:text-base">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/dating" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Dating
                                </Link>
                            </li>
                            <li>
                                <Link href="/escorts" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Escorts
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/signup/escort" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Become an Escort
                                </Link>
                            </li>
                            <li>
                                <Link href="/referral" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Referral Program
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/about" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm lg:text-base">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/legal/terms" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/privacy" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/refund" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/guidelines" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Community Guidelines
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/safety" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                    Safety Tips
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm lg:text-base">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <a href="tel:+254742449676" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                        +254 742 449 676
                                    </a>
                                    <p className="text-xs text-gray-400">24/7 Support</p>
                                </div>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <a href="https://wa.me/254742449676" target="_blank" rel="noopener noreferrer" className="text-xs lg:text-sm hover:text-pink-400 transition-colors">
                                        WhatsApp Support
                                    </a>
                                    <p className="text-xs text-gray-400">Instant response</p>
                                </div>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs lg:text-sm">Nairobi, Kenya</p>
                                    <p className="text-xs text-gray-400">Head Office</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-gray-400 mb-2">We Accept:</p>
                            <div className="flex items-center space-x-4">
                                <div className="bg-white rounded px-3 py-1.5">
                                    <span className="text-green-600 font-bold text-sm">M-PESA</span>
                                </div>
                                <span className="text-xs text-gray-500">Secure payments powered by Safaricom</span>
                            </div>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-xs text-gray-500">
                                Users must be 18+ years old
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                All transactions are secure and encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} LoveBite. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500">
                            Made with <Heart className="w-3 h-3 inline text-pink-500" /> in Kenya
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
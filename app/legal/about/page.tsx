// app/legal/about/page.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft, Heart, Users, Shield, Zap, Gift, Crown } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Heart className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">About Butical</h1>
                            <p className="text-pink-100">Connecting Hearts, Building Relationships</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Butical was born from a simple belief: everyone deserves meaningful connections. In Kenya's fast-paced world, finding genuine relationships can be challenging. We created Butical to bridge that gap, providing a safe, authentic platform for people to connect, whether they're looking for love, companionship, or professional escort services.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Since our launch, we've helped thousands of Kenyans find their perfect match, build lasting relationships, and connect with professional companions. Our platform combines modern technology with a deep understanding of local culture and values.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                                    <Heart className="w-6 h-6 text-pink-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Dating Service</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Connect with singles across Kenya looking for meaningful relationships, casual dating, or friendships.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>✓ Advanced matching algorithms</li>
                                    <li>✓ Unlimited messaging</li>
                                    <li>✓ Profile verification</li>
                                    <li>✓ KSh 300/year subscription</li>
                                </ul>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <Crown className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Escort Directory</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Professional companionship services with verified profiles for legitimate engagements.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>✓ VIP profile placement</li>
                                    <li>✓ Enhanced visibility</li>
                                    <li>✓ Professional verification</li>
                                    <li>✓ KSh 3,000/year VIP</li>
                                </ul>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Hookup Service</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Quick connections with a pay-per-unlock model for casual encounters.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>✓ Browse profiles freely</li>
                                    <li>✓ Unlock contact info</li>
                                    <li>✓ No subscription needed</li>
                                    <li>✓ KSh 150 per unlock</li>
                                </ul>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <Gift className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Referral Program</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Earn generous commissions by referring friends and family to Butical.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>✓ 50% commission on payments</li>
                                    <li>✓ Passive income potential</li>
                                    <li>✓ Easy withdrawal process</li>
                                    <li>✓ Track earnings in real-time</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                        <div className="bg-pink-50 border-l-4 border-pink-500 p-6 rounded-lg">
                            <p className="text-gray-700 leading-relaxed italic">
                                "To create a safe, inclusive platform where Kenyans can build authentic connections, whether for love, friendship, or professional companionship. We believe in empowering individuals to make their own choices while prioritizing safety, respect, and authenticity."
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Safety First</h3>
                                    <p className="text-gray-600 text-sm">
                                        We implement rigorous safety measures including profile verification, reporting tools, and 24/7 support to ensure a secure environment for all users.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Inclusivity</h3>
                                    <p className="text-gray-600 text-sm">
                                        Butical welcomes everyone regardless of gender, orientation, background, or preferences. We celebrate diversity and create space for all to connect authentically.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Authenticity</h3>
                                    <p className="text-gray-600 text-sm">
                                        We encourage genuine profiles and honest communication. Our verification processes help ensure that the person you're talking to is who they claim to be.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                                    <p className="text-gray-600 text-sm">
                                        We continuously improve our platform with new features, better matching algorithms, and enhanced user experiences based on feedback from our community.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Butical?</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">🇰🇪 Built for Kenya</h4>
                                <p className="text-sm text-gray-600">
                                    We understand Kenyan culture, values, and dating dynamics. Our platform is designed specifically for the local market.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">💰 Affordable Pricing</h4>
                                <p className="text-sm text-gray-600">
                                    Starting at just KSh 300/year for dating, we offer exceptional value with premium features at accessible prices.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">📱 M-Pesa Integration</h4>
                                <p className="text-sm text-gray-600">
                                    Seamless payments and withdrawals through M-Pesa - no credit cards or complex payment methods needed.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">🛡️ Safe Environment</h4>
                                <p className="text-sm text-gray-600">
                                    Comprehensive safety features, reporting tools, and active moderation keep our community secure.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">💬 Real-Time Chat</h4>
                                <p className="text-sm text-gray-600">
                                    Instant messaging with typing indicators, read receipts, and media sharing for seamless communication.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">🎁 Earn While You Connect</h4>
                                <p className="text-sm text-gray-600">
                                    Our 50% referral commission program lets you earn passive income by sharing Butical with friends.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Safety</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Safety isn't just a feature - it's the foundation of Butical. We employ multiple layers of protection:
                        </p>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 font-bold">•</span>
                                <span><strong>Profile Verification:</strong> We verify profiles to reduce fake accounts and catfishing</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 font-bold">•</span>
                                <span><strong>24/7 Moderation:</strong> Our team monitors the platform round-the-clock</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 font-bold">•</span>
                                <span><strong>Reporting Tools:</strong> Quick and easy reporting of suspicious behavior</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 font-bold">•</span>
                                <span><strong>Safety Resources:</strong> Comprehensive guides and tips for safe dating</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 font-bold">•</span>
                                <span><strong>Data Protection:</strong> HTTPS encryption and secure data handling</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">By the Numbers</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-pink-50 rounded-lg">
                                <p className="text-3xl font-bold text-pink-600 mb-1">1000+</p>
                                <p className="text-sm text-gray-600">Active Users</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-3xl font-bold text-purple-600 mb-1">500+</p>
                                <p className="text-sm text-gray-600">Verified Profiles</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-3xl font-bold text-green-600 mb-1">50%</p>
                                <p className="text-sm text-gray-600">Referral Commission</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-3xl font-bold text-blue-600 mb-1">24/7</p>
                                <p className="text-sm text-gray-600">Customer Support</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Have questions, feedback, or need support? We're here for you 24/7. Our dedicated team is ready to assist with any concerns or inquiries.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">WhatsApp</h4>
                                <a href="https://wa.me/254742449676" className="text-pink-600 hover:text-pink-700">
                                    +254 742 449 676
                                </a>
                                <p className="text-xs text-gray-500 mt-2">Fastest response time</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Phone</h4>
                                <a href="tel:+254742449676" className="text-pink-600 hover:text-pink-700">
                                    +254 742 449 676
                                </a>
                                <p className="text-xs text-gray-500 mt-2">Available 24/7</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Support Hours</h4>
                                <p className="text-gray-700">24/7</p>
                                <p className="text-xs text-gray-500 mt-2">Every day of the year</p>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-8 bg-gradient-to-r from-pink-50 to-purple-50 -mx-8 -mb-8 p-8 rounded-b-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Join Our Community</h2>
                        <p className="text-gray-700 text-center mb-6">
                            Whether you're looking for love, friendship, or companionship, Butical is here to help you make meaningful connections.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/auth/signup/dating"
                                className="px-8 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors text-center"
                            >
                                Start Dating
                            </Link>
                            <Link
                                href="/auth/signup/escort"
                                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors text-center"
                            >
                                Join as Escort
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Related Links */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Safety</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link href="/legal/terms" className="text-pink-600 hover:text-pink-700">
                            → Terms & Conditions
                        </Link>
                        <Link href="/legal/privacy" className="text-pink-600 hover:text-pink-700">
                            → Privacy Policy
                        </Link>
                        <Link href="/legal/refund" className="text-pink-600 hover:text-pink-700">
                            → Refund Policy
                        </Link>
                        <Link href="/legal/guidelines" className="text-pink-600 hover:text-pink-700">
                            → Community Guidelines
                        </Link>
                        <Link href="/legal/safety" className="text-pink-600 hover:text-pink-700">
                            → Safety Tips
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

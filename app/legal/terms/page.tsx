// app/legal/terms/page.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
                    <p className="text-gray-600">Last updated: November 27, 2024</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            By accessing and using LoveBite Global (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms of Service govern your use of our dating and escort connection platform. By creating an account, you represent that you are at least 18 years of age and have the legal capacity to enter into this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            LoveBite Global provides two primary services:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Dating Service:</strong> Connect with singles for meaningful relationships, casual dating, or friendships</li>
                            <li><strong>Escort Directory:</strong> Professional escort profiles for legitimate companionship services</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            We are a platform that facilitates connections. We do not employ, recommend, or endorse any user. All interactions and transactions are solely between users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>You must be at least 18 years old to create an account</li>
                            <li>You must provide accurate and complete information</li>
                            <li>You are responsible for maintaining the confidentiality of your account</li>
                            <li>One person may only maintain one account</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Types</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Dating Users:</strong> KSh 300/year subscription for full access to dating features</li>
                            <li><strong>Escorts:</strong> KSh 3,000/year VIP subscription for premium profile placement</li>
                            <li><strong>Hookup Users:</strong> Pay per unlock model (KSh 150 per profile unlock)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscriptions and Payments</h2>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Payment Terms</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>All payments are processed securely through M-Pesa</li>
                            <li>Subscriptions are billed annually unless otherwise stated</li>
                            <li>Prices are in Kenyan Shillings (KSh) and subject to change with notice</li>
                            <li>You authorize us to charge your payment method for the subscription fees</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Refund Policy</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Please refer to our <Link href="/legal/refund" className="text-pink-600 hover:text-pink-700">Refund Policy</Link> for detailed information about refunds and cancellations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Referral Program</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Users can earn 50% commission on referral payments</li>
                            <li>Commission applies to all qualifying payments (subscriptions, unlocks, VIP upgrades)</li>
                            <li>Referral codes must be used appropriately and not spammed</li>
                            <li>We reserve the right to suspend referral privileges for abuse</li>
                            <li>Minimum withdrawal amount and terms apply</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Conduct and Prohibited Activities</h2>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">You agree NOT to:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Use the Service for any illegal purpose or solicit illegal activities</li>
                            <li>Harass, abuse, or harm another person</li>
                            <li>Impersonate any person or entity</li>
                            <li>Post false, inaccurate, misleading, or defamatory content</li>
                            <li>Upload photos that do not belong to you or violate someone's rights</li>
                            <li>Solicit money from other users (except legitimate escort services)</li>
                            <li>Use automated systems or "bots" to access the Service</li>
                            <li>Engage in commercial activities without our consent</li>
                            <li>Share or distribute explicit content without consent</li>
                            <li>Promote prostitution or human trafficking</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Content and Intellectual Property</h2>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Your Content</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You retain ownership of any content you post. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with the Service.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Our Content</h3>
                        <p className="text-gray-700 leading-relaxed">
                            All content on LoveBite Global, including text, graphics, logos, and software, is owned by us or our licensors and protected by intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Your privacy is important to us. Please review our <Link href="/legal/privacy" className="text-pink-600 hover:text-pink-700">Privacy Policy</Link> to understand how we collect, use, and protect your personal information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Safety and Security</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Always meet in public places for first meetings</li>
                            <li>Never send money to people you have not met in person</li>
                            <li>Report suspicious behavior immediately</li>
                            <li>We are not responsible for user conduct offline</li>
                            <li>See our <Link href="/legal/safety" className="text-pink-600 hover:text-pink-700">Safety Tips</Link> for more information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers and Limitation of Liability</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            WE ARE NOT RESPONSIBLE FOR THE CONDUCT OF ANY USER. YOU USE THE SERVICE AT YOUR OWN RISK.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Account Termination</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We reserve the right to suspend or terminate your account at any time for:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Violation of these Terms of Service</li>
                            <li>Fraudulent or illegal activity</li>
                            <li>Harassment or abusive behavior</li>
                            <li>Creating multiple accounts</li>
                            <li>Any reason we deem necessary to protect users or the platform</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of Kenya. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Kenya.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            For questions about these Terms, please contact us:
                        </p>
                        <ul className="text-gray-700 space-y-2">
                            <li><strong>WhatsApp:</strong> +254 742 449 676</li>
                            <li><strong>Phone:</strong> +254 742 449 676</li>
                            <li><strong>Hours:</strong> 24/7 Customer Support</li>
                        </ul>
                    </section>

                    <section className="border-t pt-6">
                        <p className="text-gray-600 text-sm">
                            By using LoveBite Global, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                        </p>
                    </section>
                </div>

                {/* Related Links */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

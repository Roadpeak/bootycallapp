// app/legal/privacy/page.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-600">Last updated: November 27, 2024</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            At LoveBite Global, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dating and escort connection platform.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            By using our Service, you consent to the data practices described in this policy. If you do not agree with this policy, please discontinue use of our Service immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            When you create an account, we collect:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Name and display name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Date of birth (to verify age requirement)</li>
                            <li>Gender and gender preferences</li>
                            <li>Location information (city, area)</li>
                            <li>Profile photos</li>
                            <li>Bio and interests</li>
                            <li>Education and occupation (optional)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Payment Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            For subscriptions and payments:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>M-Pesa phone number</li>
                            <li>Transaction details</li>
                            <li>Subscription status and history</li>
                            <li>Referral earnings and wallet balance</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            Note: We do not store your M-Pesa PIN or other sensitive payment credentials. All payments are processed securely through M-Pesa's payment gateway.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Usage Information</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Profile views and interactions</li>
                            <li>Matches and connections</li>
                            <li>Messages sent and received</li>
                            <li>Search preferences and filters</li>
                            <li>Feature usage patterns</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.4 Technical Information</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Device type and operating system</li>
                            <li>Browser type and version</li>
                            <li>IP address</li>
                            <li>Cookies and similar tracking technologies</li>
                            <li>App version and crash reports</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use the collected information for:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Service Delivery:</strong> To provide, maintain, and improve our platform</li>
                            <li><strong>Matchmaking:</strong> To connect you with compatible users based on preferences</li>
                            <li><strong>Communication:</strong> To send you notifications, updates, and messages</li>
                            <li><strong>Payment Processing:</strong> To process subscriptions and referral commissions</li>
                            <li><strong>Safety:</strong> To verify identities and prevent fraud or abuse</li>
                            <li><strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
                            <li><strong>Customer Support:</strong> To respond to inquiries and provide assistance</li>
                            <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Public Profile Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The following information is visible to other users:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Display name and photos</li>
                            <li>Age and location (city/area)</li>
                            <li>Bio, interests, and preferences</li>
                            <li>Education and occupation (if provided)</li>
                            <li>Subscription status (Premium/VIP badges)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Third-Party Service Providers</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We may share information with trusted service providers who assist us:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Payment processors (M-Pesa/Safaricom)</li>
                            <li>Cloud hosting providers</li>
                            <li>Analytics services</li>
                            <li>Customer support tools</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Legal Requirements</h3>
                        <p className="text-gray-700 leading-relaxed">
                            We may disclose your information if required by law, court order, or to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Comply with legal processes</li>
                            <li>Protect our rights and property</li>
                            <li>Investigate fraud or security issues</li>
                            <li>Protect the safety of users</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We implement appropriate technical and organizational measures to protect your information:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>HTTPS encryption for data transmission</li>
                            <li>Secure password hashing</li>
                            <li>Regular security audits</li>
                            <li>Access controls and authentication</li>
                            <li>Data backup and recovery systems</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You have the following rights regarding your personal information:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                            <li><strong>Portability:</strong> Receive your data in a portable format</li>
                            <li><strong>Objection:</strong> Object to certain data processing activities</li>
                            <li><strong>Restriction:</strong> Request limitation of data processing</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            To exercise these rights, contact us via WhatsApp at +254 742 449 676 or through the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We retain your information for as long as necessary to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Provide our services to you</li>
                            <li>Comply with legal obligations</li>
                            <li>Resolve disputes and enforce agreements</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            When you delete your account, we will remove your profile from public view immediately. Some information may be retained in backup systems for a limited period for legal and security purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use cookies and similar technologies to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Keep you logged in</li>
                            <li>Remember your preferences</li>
                            <li>Analyze usage patterns</li>
                            <li>Improve platform performance</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            You can control cookies through your browser settings, but disabling them may affect functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Our platform may contain links to third-party websites or services (e.g., social media). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Your information may be transferred to and maintained on servers located outside of Kenya. By using our Service, you consent to this transfer. We ensure appropriate safeguards are in place to protect your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Privacy Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. The updated policy will be posted with a new "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have questions about this Privacy Policy or our data practices, contact us:
                        </p>
                        <ul className="text-gray-700 space-y-2">
                            <li><strong>WhatsApp:</strong> +254 742 449 676</li>
                            <li><strong>Phone:</strong> +254 742 449 676</li>
                            <li><strong>Hours:</strong> 24/7 Customer Support</li>
                        </ul>
                    </section>

                    <section className="border-t pt-6">
                        <p className="text-gray-600 text-sm">
                            Your privacy matters to us. We are committed to protecting your personal information and being transparent about our data practices.
                        </p>
                    </section>
                </div>

                {/* Related Links */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link href="/legal/terms" className="text-pink-600 hover:text-pink-700">
                            → Terms & Conditions
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

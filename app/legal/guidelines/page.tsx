// app/legal/guidelines/page.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Heart, Users, AlertTriangle } from 'lucide-react'

export default function GuidelinesPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Guidelines</h1>
                    <p className="text-gray-600">Last updated: November 27, 2024</p>
                    <p className="text-gray-700 mt-4">
                        LoveBite Global is built on respect, safety, and authenticity. These guidelines help maintain a positive environment for everyone.
                    </p>
                </div>

                {/* Core Values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <Shield className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Safety First</h3>
                        <p className="text-sm text-gray-600">Protect yourself and others</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <Heart className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Respect Always</h3>
                        <p className="text-sm text-gray-600">Treat everyone with dignity</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <Users className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Be Authentic</h3>
                        <p className="text-sm text-gray-600">Honest profiles build trust</p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Be Authentic and Honest</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">✓ Do:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Use your real photos (taken within the last year)</li>
                            <li>Provide accurate information about yourself</li>
                            <li>Be honest about your intentions and what you're looking for</li>
                            <li>Use your actual name or a genuine nickname</li>
                            <li>Update your profile if your situation changes</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">✗ Don't:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Use someone else's photos</li>
                            <li>Lie about your age, location, or relationship status</li>
                            <li>Create fake profiles or impersonate others</li>
                            <li>Use heavily edited or misleading photos</li>
                            <li>Misrepresent your profession or background</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Respect and Courtesy</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">✓ Do:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Treat all users with respect and kindness</li>
                            <li>Accept rejection gracefully</li>
                            <li>Communicate clearly and politely</li>
                            <li>Respect boundaries and consent</li>
                            <li>Report inappropriate behavior</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">✗ Don't:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Send unsolicited explicit messages or photos</li>
                            <li>Harass, stalk, or threaten other users</li>
                            <li>Use offensive, discriminatory, or hateful language</li>
                            <li>Pressure others into meeting or sharing personal information</li>
                            <li>Continue messaging after being blocked or rejected</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Appropriate Content</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Profile Photos - Allowed:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Clear face photos showing your features</li>
                            <li>Full body photos in appropriate attire</li>
                            <li>Professional or casual photos</li>
                            <li>Photos in public settings</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Profile Photos - Not Allowed:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Nudity or sexually explicit content</li>
                            <li>Photos with minors present</li>
                            <li>Violent, graphic, or disturbing images</li>
                            <li>Images promoting illegal activities</li>
                            <li>Photos with watermarks from other platforms</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Messages and Chat:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Keep first messages friendly and respectful</li>
                            <li>Wait for consent before sharing explicit content</li>
                            <li>No spam, advertisements, or promotional content</li>
                            <li>No sharing of illegal content or services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Safety and Privacy</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Protecting Yourself:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Don't share financial information or bank details</li>
                            <li>Don't send money to people you haven't met</li>
                            <li>Meet in public places for first meetings</li>
                            <li>Tell someone where you're going</li>
                            <li>Trust your instincts - if something feels wrong, it probably is</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Protecting Others:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Don't share screenshots of private conversations</li>
                            <li>Respect others' privacy and confidentiality</li>
                            <li>Don't distribute others' personal information</li>
                            <li>Report suspicious or dangerous behavior</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Escort-Specific Guidelines</h2>

                        <div className="bg-pink-50 border-l-4 border-pink-500 p-4 mb-4">
                            <p className="text-gray-700">
                                <strong>Important:</strong> LoveBite Global facilitates connections for legitimate companionship services only. All activities must comply with local laws.
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">For Escorts:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Clearly state your services and rates</li>
                            <li>Be professional and responsive</li>
                            <li>Screen clients for your safety</li>
                            <li>Honor your stated rates and boundaries</li>
                            <li>Report clients who are abusive or violate agreements</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">For Clients:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Respect boundaries and stated services</li>
                            <li>Pay agreed rates promptly</li>
                            <li>Be clean, punctual, and respectful</li>
                            <li>Don't negotiate after agreement is made</li>
                            <li>Respect privacy - no recording without consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>

                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-900 mb-2">Zero Tolerance Policy</p>
                                    <p className="text-red-800 text-sm">
                                        The following activities will result in immediate account termination and may be reported to authorities.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Human Trafficking:</strong> Any form of exploitation or coercion</li>
                            <li><strong>Minors:</strong> Any content involving anyone under 18</li>
                            <li><strong>Non-Consensual Content:</strong> Revenge porn or unauthorized intimate images</li>
                            <li><strong>Violence:</strong> Threats, promotion of violence, or harmful content</li>
                            <li><strong>Illegal Activities:</strong> Drug sales, weapons, or other illegal services</li>
                            <li><strong>Scams:</strong> Financial fraud, catfishing, or deceptive schemes</li>
                            <li><strong>Spam:</strong> Mass messaging, bots, or automated activity</li>
                            <li><strong>Discrimination:</strong> Racism, sexism, homophobia, or other hate speech</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dating Service Guidelines</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Creating Meaningful Connections:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Be clear about what you're looking for (relationship, casual, friendship)</li>
                            <li>Read profiles before messaging</li>
                            <li>Ask questions and show genuine interest</li>
                            <li>Be patient - building connections takes time</li>
                            <li>If not interested, politely decline rather than ghosting</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">First Dates:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Meet in public places during daytime</li>
                            <li>Arrange your own transportation</li>
                            <li>Stay sober enough to make good decisions</li>
                            <li>Let someone know where you'll be</li>
                            <li>Have your phone charged and accessible</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Referral Program Ethics</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Don't spam your referral code</li>
                            <li>Be honest about the service when referring others</li>
                            <li>Don't create fake accounts to earn commissions</li>
                            <li>Don't mislead people about earnings potential</li>
                            <li>Respect others' decision not to use your referral code</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Reporting and Enforcement</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Report:</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you encounter behavior that violates these guidelines:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Use the in-app report feature on profiles and messages</li>
                            <li>Contact support via WhatsApp: +254 742 449 676</li>
                            <li>Provide screenshots or evidence if possible</li>
                            <li>Block users who make you uncomfortable</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">What We'll Do:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Review all reports within 24-48 hours</li>
                            <li>Take appropriate action (warning, suspension, or ban)</li>
                            <li>Report serious violations to authorities when necessary</li>
                            <li>Keep your report confidential</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Consequences of Violations</h2>

                        <div className="space-y-4">
                            <div className="border-l-4 border-yellow-500 pl-4">
                                <h4 className="font-semibold text-gray-900 mb-1">First Offense (Minor Violations)</h4>
                                <p className="text-gray-700 text-sm">Warning and educational message</p>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-semibold text-gray-900 mb-1">Second Offense or Moderate Violations</h4>
                                <p className="text-gray-700 text-sm">Temporary suspension (7-30 days)</p>
                            </div>

                            <div className="border-l-4 border-red-500 pl-4">
                                <h4 className="font-semibold text-gray-900 mb-1">Serious or Repeated Violations</h4>
                                <p className="text-gray-700 text-sm">Permanent ban with no refund</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Appeals Process</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you believe your account was suspended or banned in error:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Contact support within 7 days of action</li>
                            <li>Provide explanation and any relevant evidence</li>
                            <li>Appeals are reviewed by senior team members</li>
                            <li>Final decision will be communicated within 7 business days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Updates to Guidelines</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These guidelines may be updated periodically to reflect new features, user feedback, or legal requirements. Continued use of LoveBite Global constitutes acceptance of the current guidelines.
                        </p>
                    </section>

                    <section className="border-t pt-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Questions about these guidelines?
                        </p>
                        <ul className="text-gray-700 space-y-2">
                            <li><strong>WhatsApp:</strong> +254 742 449 676</li>
                            <li><strong>Phone:</strong> +254 742 449 676</li>
                            <li><strong>Hours:</strong> 24/7 Customer Support</li>
                        </ul>
                    </section>

                    <section className="border-t pt-6 bg-pink-50 -mx-8 -mb-8 p-8 rounded-b-lg">
                        <p className="text-gray-700 text-center font-medium">
                            Together, we can build a safe, respectful, and authentic community. Thank you for being part of LoveBite Global!
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
                        <Link href="/legal/privacy" className="text-pink-600 hover:text-pink-700">
                            → Privacy Policy
                        </Link>
                        <Link href="/legal/refund" className="text-pink-600 hover:text-pink-700">
                            → Refund Policy
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

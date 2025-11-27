// app/legal/refund/page.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RefundPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
                    <p className="text-gray-600">Last updated: November 27, 2024</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            At LoveBite Global, we strive to provide excellent service to all our users. This Refund Policy outlines the circumstances under which refunds may be issued for subscriptions and other payments made on our platform.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            By making a payment on LoveBite Global, you acknowledge that you have read and agree to this Refund Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Subscription Services</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Dating Subscriptions (KSh 300/year)</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Dating subscriptions provide access to premium features including unlimited messaging, profile views, and advanced matching.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>7-day money-back guarantee from the date of purchase</li>
                            <li>Refunds available if service is not as described</li>
                            <li>Technical issues preventing service access may qualify for refund</li>
                            <li>No refund after 7 days unless exceptional circumstances apply</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Escort VIP Subscriptions (KSh 3,000/year)</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            VIP subscriptions provide premium profile placement and enhanced visibility.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>7-day money-back guarantee from the date of purchase</li>
                            <li>Refunds available if service features are not delivered</li>
                            <li>No refund if account is suspended due to policy violations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Profile Unlocks (Hookup Service)</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Profile unlocks (KSh 150 per profile) are non-refundable once the unlock has been processed and contact information revealed.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Refundable:</strong> If technical error prevents access to unlocked profile</li>
                            <li><strong>Refundable:</strong> If profile was removed or fake</li>
                            <li><strong>Non-refundable:</strong> After contact information is successfully viewed</li>
                            <li><strong>Non-refundable:</strong> If user is unreachable or unresponsive</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Refund Eligibility</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Qualifying Reasons for Refund</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Service features not delivered as promised</li>
                            <li>Technical issues preventing access to paid features</li>
                            <li>Duplicate or accidental payment</li>
                            <li>Unauthorized payment from your account</li>
                            <li>Service outage lasting more than 48 hours</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Non-Qualifying Reasons</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Change of mind after 7-day guarantee period</li>
                            <li>Lack of matches or connections (this is not guaranteed)</li>
                            <li>Account suspended for violating Terms of Service</li>
                            <li>Dissatisfaction with other users' behavior</li>
                            <li>Difficulty in finding suitable matches</li>
                            <li>Technical issues on user's device or internet connection</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Request Process</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 1: Contact Support</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            To request a refund, contact our customer support team:
                        </p>
                        <ul className="text-gray-700 space-y-2 ml-4 mb-4">
                            <li><strong>WhatsApp:</strong> +254 742 449 676</li>
                            <li><strong>Phone:</strong> +254 742 449 676</li>
                            <li><strong>Hours:</strong> 24/7 Support</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2: Provide Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Include the following in your refund request:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Your registered phone number or email</li>
                            <li>Transaction date and M-Pesa confirmation code</li>
                            <li>Reason for refund request</li>
                            <li>Any supporting evidence (screenshots, error messages, etc.)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3: Review Process</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Refund requests are reviewed within 3-5 business days</li>
                            <li>We may contact you for additional information</li>
                            <li>You will be notified of the decision via email or SMS</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Refund Timeline</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Once a refund is approved:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>M-Pesa Refunds:</strong> Processed within 5-7 business days</li>
                            <li><strong>Referral Wallet:</strong> Credit reversed immediately</li>
                            <li>You will receive a confirmation message when refund is processed</li>
                            <li>Contact your mobile money provider if refund is not received within stated timeline</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Partial Refunds</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            In some cases, partial refunds may be issued:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>If you have used part of the service before requesting refund</li>
                            <li>If service was unavailable for a portion of the subscription period</li>
                            <li>Prorated based on days of service used vs. total subscription period</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cancellations</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Subscription Cancellation</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You can cancel your subscription at any time:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Cancel through your profile settings or contact support</li>
                            <li>Access continues until the end of current billing period</li>
                            <li>No refund for remaining subscription time (unless within 7-day guarantee)</li>
                            <li>Auto-renewal will be disabled upon cancellation</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Account Deletion</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Deleting your account does not automatically trigger a refund. Active subscriptions will remain until expiration unless a refund is separately requested and approved.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Referral Commission Refunds</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If a payment made through your referral link is refunded:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>The corresponding 50% commission will be deducted from your wallet</li>
                            <li>If wallet balance is insufficient, future commissions will be adjusted</li>
                            <li>You will be notified of any commission adjustments</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Fraudulent Refund Requests</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We take fraud seriously. Abuse of our refund policy may result in:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Denial of current and future refund requests</li>
                            <li>Suspension or termination of account</li>
                            <li>Legal action for fraudulent chargebacks</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disputes</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If your refund request is denied and you wish to dispute the decision:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Contact our support team to escalate your case</li>
                            <li>Provide any additional evidence to support your claim</li>
                            <li>A senior team member will review your case within 7 business days</li>
                            <li>Final decisions will be communicated via email</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Refund Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to modify this Refund Policy at any time. Changes will be posted with a new "Last updated" date. Continued use of the Service after changes constitutes acceptance of the revised policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            For refund requests or questions about this policy:
                        </p>
                        <ul className="text-gray-700 space-y-2">
                            <li><strong>WhatsApp:</strong> +254 742 449 676</li>
                            <li><strong>Phone:</strong> +254 742 449 676</li>
                            <li><strong>Hours:</strong> 24/7 Customer Support</li>
                        </ul>
                    </section>

                    <section className="border-t pt-6 bg-pink-50 -mx-8 -mb-8 p-8 rounded-b-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Summary</h3>
                        <ul className="text-gray-700 space-y-2">
                            <li>✓ 7-day money-back guarantee on subscriptions</li>
                            <li>✓ Refunds processed within 5-7 business days</li>
                            <li>✓ Contact +254 742 449 676 for refund requests</li>
                            <li>✓ Profile unlocks refundable only for technical issues or fake profiles</li>
                        </ul>
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

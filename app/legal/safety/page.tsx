// app/legal/safety/page.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, MapPin, Users, Phone, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function SafetyPage() {
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
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-pink-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Tips</h1>
                            <p className="text-gray-600">Your safety is our top priority</p>
                        </div>
                    </div>
                    <p className="text-gray-700">
                        Whether you're using our dating or escort services, following these safety guidelines will help ensure positive and secure experiences.
                    </p>
                </div>

                {/* Emergency Info */}
                <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
                    <div className="flex items-start">
                        <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-red-900 mb-2">Emergency Contacts</h3>
                            <ul className="text-red-800 space-y-1">
                                <li><strong>Police Emergency:</strong> 999 or 112</li>
                                <li><strong>Butical Support:</strong> +254 742 449 676 (24/7)</li>
                                <li><strong>Gender Violence Hotline:</strong> 1195</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-6 h-6 text-pink-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Meeting in Person</h2>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Before the Meeting</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Get to know them first</p>
                                    <p className="text-sm text-gray-600">Have multiple conversations before meeting. Video call if possible to verify identity.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Choose public locations</p>
                                    <p className="text-sm text-gray-600">Meet at busy restaurants, cafes, or shopping centers during daytime hours.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Tell someone where you're going</p>
                                    <p className="text-sm text-gray-600">Share your location, who you're meeting, and when you expect to return.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Arrange your own transportation</p>
                                    <p className="text-sm text-gray-600">Drive yourself or use a trusted taxi/ride-sharing service. Don't rely on your date for transportation.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">During the Meeting</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Stay in public areas</p>
                                    <p className="text-sm text-gray-600">Don't go to private locations (homes, hotels) on first meeting.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Keep your phone charged</p>
                                    <p className="text-sm text-gray-600">Ensure your phone is fully charged and easily accessible.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Watch your drink</p>
                                    <p className="text-sm text-gray-600">Don't leave drinks unattended. Order your own drinks and watch them being prepared.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Trust your instincts</p>
                                    <p className="text-sm text-gray-600">If something feels off, leave immediately. Your safety comes first.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-pink-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Online Safety</h2>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Protecting Your Information</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Don't share financial information</p>
                                    <p className="text-sm text-gray-600">Never share bank details, M-Pesa PIN, credit card info, or send money.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Be cautious with personal details</p>
                                    <p className="text-sm text-gray-600">Don't share your home address, workplace, or daily routines too early.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Avoid sharing explicit content</p>
                                    <p className="text-sm text-gray-600">Once shared, you lose control of images and videos. They can be misused.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Use the platform messaging</p>
                                    <p className="text-sm text-gray-600">Keep conversations on Butical initially. This provides a record if issues arise.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Recognizing Red Flags</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-900 mb-3">⚠️ Warning Signs:</p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Asks for money or financial help</li>
                                <li>• Refuses to video chat or meet in person</li>
                                <li>• Profile seems too good to be true</li>
                                <li>• Gets overly personal or romantic too quickly</li>
                                <li>• Pressures you to move off the platform immediately</li>
                                <li>• Story doesn't add up or keeps changing</li>
                                <li>• Avoids answering direct questions</li>
                                <li>• Makes you feel uncomfortable or unsafe</li>
                            </ul>
                        </div>
                    </section>

                    <section className="border-t pt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Escort Service Safety</h2>

                        <div className="bg-pink-50 border-l-4 border-pink-500 p-4 mb-6">
                            <p className="text-gray-700">
                                <strong>For both escorts and clients:</strong> Professional companionship services require extra safety precautions. Follow these guidelines for secure interactions.
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">For Escorts</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Screen clients thoroughly</p>
                                    <p className="text-sm text-gray-600">Ask questions, verify identity, and check for any red flags before agreeing to meet.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Always tell someone</p>
                                    <p className="text-sm text-gray-600">Share client details, meeting location, and check-in times with a trusted friend.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Set clear boundaries</p>
                                    <p className="text-sm text-gray-600">Communicate your services, rates, and limits upfront. Don't be pressured to do anything uncomfortable.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Choose meeting locations carefully</p>
                                    <p className="text-sm text-gray-600">Meet at reputable hotels or locations where you feel secure. Avoid isolated areas.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Trust your instincts</p>
                                    <p className="text-sm text-gray-600">If a client makes you uncomfortable, you have the right to refuse service and leave.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">For Clients</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Respect boundaries and agreements</p>
                                    <p className="text-sm text-gray-600">Honor agreed services, rates, and time limits. No means no.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Practice good hygiene</p>
                                    <p className="text-sm text-gray-600">Be clean and well-groomed. This shows respect for the escort.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Pay promptly and as agreed</p>
                                    <p className="text-sm text-gray-600">Have the agreed amount ready. Don't negotiate after services have begun.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Respect privacy</p>
                                    <p className="text-sm text-gray-600">No photos or recordings without explicit consent. Maintain confidentiality.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Safety</h2>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="font-semibold text-red-900 mb-2">🚨 NEVER Send Money To:</p>
                            <ul className="space-y-1 text-red-800 text-sm">
                                <li>✗ Someone you haven't met in person</li>
                                <li>✗ Anyone claiming to be in an emergency</li>
                                <li>✗ People asking for "verification fees"</li>
                                <li>✗ Users requesting advance payments</li>
                                <li>✗ Anyone claiming to love you after brief contact</li>
                            </ul>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Common Scams to Avoid</h3>
                        <div className="space-y-4">
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="font-semibold text-gray-900">Romance Scams</p>
                                <p className="text-sm text-gray-600">Scammer builds emotional connection then asks for money for emergencies, travel, or investment opportunities.</p>
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="font-semibold text-gray-900">Catfishing</p>
                                <p className="text-sm text-gray-600">Fake profile using stolen photos. Refuses to video chat or meet in person.</p>
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="font-semibold text-gray-900">Extortion</p>
                                <p className="text-sm text-gray-600">Threatens to share intimate content unless you pay. Report immediately - don't pay.</p>
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="font-semibold text-gray-900">Fake Escorts</p>
                                <p className="text-sm text-gray-600">Demands upfront payment then disappears. Always verify identity first.</p>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Phone className="w-6 h-6 text-pink-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Reporting and Getting Help</h2>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Report Immediately If:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
                            <li>Someone asks you for money</li>
                            <li>You receive threats or feel unsafe</li>
                            <li>Someone shares explicit content without consent</li>
                            <li>You suspect a fake or stolen profile</li>
                            <li>Someone is underage</li>
                            <li>You witness or experience harassment</li>
                            <li>Someone violates community guidelines</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Report:</h3>
                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium text-gray-900 mb-2">In-App Reporting</p>
                                <p className="text-sm text-gray-600">Use the report button on any profile or message. Our team reviews all reports within 24-48 hours.</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium text-gray-900 mb-2">Contact Support</p>
                                <p className="text-sm text-gray-600 mb-2">For urgent matters, contact us directly:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li><strong>WhatsApp:</strong> +254 742 449 676</li>
                                    <li><strong>Phone:</strong> +254 742 449 676</li>
                                    <li><strong>Available:</strong> 24/7</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium text-gray-900 mb-2">Police / Authorities</p>
                                <p className="text-sm text-gray-600">For crimes or immediate danger, contact local police (999/112) first, then notify us.</p>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">National Police Service</h4>
                                <p className="text-sm text-gray-600 mb-2">Emergency: 999 or 112</p>
                                <p className="text-xs text-gray-500">For immediate threats or crimes in progress</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Gender Violence Recovery Centre</h4>
                                <p className="text-sm text-gray-600 mb-2">Hotline: 1195</p>
                                <p className="text-xs text-gray-500">24/7 support for gender-based violence survivors</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">FIDA Kenya</h4>
                                <p className="text-sm text-gray-600 mb-2">Tel: +254 20 387 0 465</p>
                                <p className="text-xs text-gray-500">Legal aid and support for women and children</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Butical Support</h4>
                                <p className="text-sm text-gray-600 mb-2">WhatsApp: +254 742 449 676</p>
                                <p className="text-xs text-gray-500">24/7 platform support and safety assistance</p>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-6 bg-green-50 -mx-8 -mb-8 p-8 rounded-b-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            Remember: Your Safety Comes First
                        </h3>
                        <ul className="text-gray-700 space-y-2">
                            <li>✓ Trust your instincts - if something feels wrong, it probably is</li>
                            <li>✓ You have the right to say no and leave any situation</li>
                            <li>✓ Real connections take time - be patient and cautious</li>
                            <li>✓ We're here to help 24/7 - don't hesitate to reach out</li>
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
                        <Link href="/legal/refund" className="text-pink-600 hover:text-pink-700">
                            → Refund Policy
                        </Link>
                        <Link href="/legal/guidelines" className="text-pink-600 hover:text-pink-700">
                            → Community Guidelines
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

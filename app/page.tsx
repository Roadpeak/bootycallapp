'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, Heart, Star, ArrowRight } from 'lucide-react'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'

const cards = [
  {
    href: '/escorts',
    image: '/images/icon1.png',
    alt: 'Hookups',
    title: 'Looking for Hookups',
    description: 'Browse verified escorts near you',
    gradient: 'from-rose-500 to-pink-600',
    border: 'hover:border-rose-500',
    glow: 'hover:shadow-rose-500/20',
    badge: 'Hot',
    badgeColor: 'bg-rose-500',
  },
  {
    href: '/auth/signup/dating',
    image: '/images/dating.jpg',
    alt: 'Dating',
    title: 'Dating',
    description: 'Find meaningful connections',
    gradient: 'from-pink-500 to-rose-600',
    border: 'hover:border-pink-500',
    glow: 'hover:shadow-pink-500/20',
    badge: 'Popular',
    badgeColor: 'bg-pink-500',
  },
  {
    href: '/auth/signup/escort',
    image: '/images/icon2.png',
    alt: 'Become an Escort',
    title: 'Become an Escort',
    description: 'Earn on your own schedule',
    gradient: 'from-purple-500 to-pink-600',
    border: 'hover:border-purple-500',
    glow: 'hover:shadow-purple-500/20',
    badge: 'Earn',
    badgeColor: 'bg-purple-500',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

const headingVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/20 to-rose-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={headingVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Sparkles className="w-4 h-4" />
            Kenya's #1 Connection Platform
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            What are you{' '}
            <span className="gradient-text">interested in?</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Choose your path and start connecting today
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cards.map((card) => (
            <motion.div key={card.href} variants={cardVariants}>
              <Link href={card.href} className="block h-full">
                <motion.div
                  className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl ${card.glow} transition-all duration-400 overflow-hidden border-2 border-transparent ${card.border} h-full cursor-pointer`}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Top gradient strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient}`} />

                  {/* Badge */}
                  <div className={`absolute top-5 right-5 ${card.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
                    {card.badge}
                  </div>

                  {/* Background glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />

                  <div className="relative p-8 flex flex-col items-center text-center">
                    {/* Image */}
                    <motion.div
                      className={`w-24 h-24 rounded-2xl mb-6 shadow-xl overflow-hidden bg-gradient-to-br ${card.gradient} ring-4 ring-white`}
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Image
                        src={card.image}
                        alt={card.alt}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">{card.description}</p>

                    {/* CTA */}
                    <motion.div
                      className={`inline-flex items-center gap-2 bg-gradient-to-r ${card.gradient} text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md`}
                      whileHover={{ gap: 10 }}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom trust bar */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>1,000+ active users</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-pink-400" />
            <span>Verified profiles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>Secure & private</span>
          </div>
        </motion.div>

        {/* PWA Install CTA */}
        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <PWAInstallPrompt variant="landing-cta" />
        </motion.div>
      </div>
    </div>
  )
}

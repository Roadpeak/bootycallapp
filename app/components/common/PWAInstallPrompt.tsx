'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Share, Plus, Heart } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallVariant = 'banner' | 'landing-cta'

interface PWAInstallPromptProps {
  variant?: InstallVariant
}

export default function PWAInstallPrompt({ variant = 'banner' }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const inStandaloneMode = ('standalone' in navigator) && (navigator as any).standalone
    setIsIOS(ios)

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed)
      // Show again after 3 days
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return
    }

    // Listen for beforeinstallprompt (Android/Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For iOS: show banner after 5 seconds if on iOS Safari and not installed
    if (ios && !inStandaloneMode) {
      setTimeout(() => setShowBanner(true), 5000)
    }

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true)
      return
    }

    if (!deferredPrompt) return

    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowBanner(false)
      }
    } catch (err) {
      console.error('Install failed:', err)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString())
  }

  // Landing page CTA button variant
  if (variant === 'landing-cta') {
    if (isInstalled) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium">
          <Smartphone className="w-4 h-4" />
          App Installed ✓
        </div>
      )
    }

    // Only show CTA if install is available
    if (!deferredPrompt && !isIOS) return null

    return (
      <>
        <motion.button
          onClick={handleInstall}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-pink-200 text-pink-700 rounded-2xl text-sm font-semibold hover:bg-pink-50 hover:border-pink-400 transition-all shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Download className="w-4 h-4" />
          Install App
        </motion.button>

        {/* iOS instructions modal */}
        <AnimatePresence>
          {showIOSInstructions && (
            <IOSInstructionsModal onClose={() => setShowIOSInstructions(false)} />
          )}
        </AnimatePresence>
      </>
    )
  }

  // Bottom banner variant (default)
  return (
    <>
      <AnimatePresence>
        {showBanner && !isInstalled && (
          <motion.div
            className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[60]"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/20 border border-gray-100 p-4 relative overflow-hidden">
              {/* Pink accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-t-3xl" />

              <button
                onClick={handleDismiss}
                className="absolute top-3.5 right-3.5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 mt-1">
                {/* App icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/30">
                  <Heart className="w-7 h-7 text-white fill-white" />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className="font-bold text-gray-900 text-sm">Install LoveBite</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {isIOS
                      ? 'Add to Home Screen for the full app experience'
                      : 'Get the full app — faster, offline access & notifications'
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3.5">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Not now
                </button>
                <motion.button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 py-2 text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isInstalling ? (
                    <motion.div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      {isIOS ? 'How to Install' : 'Install Free'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS instructions modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <IOSInstructionsModal onClose={() => setShowIOSInstructions(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

function IOSInstructionsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-md shadow-pink-500/25">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Install LoveBite</p>
            <p className="text-xs text-gray-500">Add to your Home Screen</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: <Share className="w-5 h-5 text-blue-500" />, step: '1', text: 'Tap the Share button at the bottom of Safari' },
            { icon: <Plus className="w-5 h-5 text-pink-500" />, step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
            { icon: <Smartphone className="w-5 h-5 text-green-500" />, step: '3', text: 'Tap "Add" — LoveBite will appear on your Home Screen!' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <p className="text-sm text-gray-700 pt-1 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <motion.button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-sm font-semibold shadow-md shadow-pink-500/25"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Got it!
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

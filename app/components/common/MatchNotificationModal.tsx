'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, MessageCircle, Sparkles } from 'lucide-react'
import type { MatchNotification } from '../types/chat'
import { getImageUrl } from '@/lib/utils/image'

interface MatchNotificationModalProps {
    match: MatchNotification
    show: boolean
    onClose: () => void
    onSendMessage: () => void
}

export const MatchNotificationModal = ({ match, show, onClose, onSendMessage }: MatchNotificationModalProps) => {
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                    {/* Modal */}
                    <motion.div
                        className="relative bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl"
                        initial={{ scale: 0.7, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Gradient top */}
                        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 pt-10 pb-16 px-6 relative overflow-hidden text-center">
                            {/* Animated particles */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                                    style={{ left: `${10 + i * 15}%`, top: '20%' }}
                                    animate={{ y: [-10, -40, -10], opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                                />
                            ))}

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>

                            {/* Hearts animation */}
                            <motion.div
                                className="relative inline-flex items-center justify-center mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.3, 1] }}
                                transition={{ duration: 0.6, times: [0, 0.7, 1] }}
                            >
                                <motion.div
                                    className="absolute w-20 h-20 bg-white/20 rounded-full"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <Heart className="w-14 h-14 text-white fill-white relative z-10 drop-shadow-lg" />
                                <motion.div
                                    className="absolute -top-1 -right-1"
                                    animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                </motion.div>
                            </motion.div>

                            <motion.h2
                                className="text-3xl font-bold text-white mb-1"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                It's a Match!
                            </motion.h2>
                            <motion.p
                                className="text-pink-100 text-sm"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                You and {match.matchedUser.name} liked each other
                            </motion.p>
                        </div>

                        {/* Profile section — overlapping card */}
                        <div className="relative px-6 pb-6">
                            <motion.div
                                className="flex flex-col items-center -mt-10"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="relative">
                                    <img
                                        src={getImageUrl(match.matchedUser.avatar)}
                                        alt={match.matchedUser.name}
                                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                                    />
                                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-green-400 rounded-xl flex items-center justify-center border-2 border-white">
                                        <Heart className="w-3.5 h-3.5 text-white fill-white" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mt-3">
                                    {match.matchedUser.name}, {match.matchedUser.age}
                                </h3>
                                {match.matchedUser.bio && (
                                    <p className="text-gray-500 text-sm text-center max-w-xs mt-1 line-clamp-2 leading-relaxed">
                                        {match.matchedUser.bio}
                                    </p>
                                )}
                            </motion.div>

                            {/* Actions */}
                            <motion.div
                                className="flex gap-3 mt-6"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.button
                                    onClick={onClose}
                                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    Keep Browsing
                                </motion.button>
                                <motion.button
                                    onClick={onSendMessage}
                                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 hover:shadow-pink-500/50 transition-all"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Message
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

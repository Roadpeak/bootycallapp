'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 py-8">
      <div className="max-w-5xl w-full">
        {/* Main Question */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
            What are you interested in?
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Choose an option to get started
          </p>
        </div>

        {/* Three Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Hookups - First */}
          <Link href="/escorts" className="block">
            <div className="group relative bg-white rounded-2xl shadow-lg active:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-rose-500 active:scale-95 cursor-pointer h-full min-h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative p-6 md:p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600">
                  {/* Replace src with your actual image path */}
                  <Image
                    src="/images/escort.jpg"
                    alt="Hookups"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                  Looking for Hookups
                </h3>

                
              </div>
            </div>
          </Link>

          {/* Dating - Second */}
          <Link href="/auth/signup/dating" className="block">
            <div className="group relative bg-white rounded-2xl shadow-lg active:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-pink-500 active:scale-95 cursor-pointer h-full min-h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative p-6 md:p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600">
                  {/* Replace src with your actual image path */}
                  <Image
                    src="/images/dating.jpg"
                    alt="Dating"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                  Dating
                </h3>

                
              </div>
            </div>
          </Link>

          {/* Become an Escort - Third */}
          <Link href="/auth/signup/escort" className="block">
            <div className="group relative bg-white rounded-2xl shadow-lg active:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-500 active:scale-95 cursor-pointer h-full min-h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative p-6 md:p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600">
                  {/* Replace src with your actual image path */}
                  <Image
                    src="/images/escort-icon.jpg"
                    alt="Become an Escort"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                  Become an Escort
                </h3>

               
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
'use client'

import { usePathname } from 'next/navigation'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Don't add top padding for auth pages since navbar is hidden there
    const isAuthPage = pathname?.startsWith('/auth/')

    // Top bar (~28px) + Main navbar (~56-72px) = ~100px mobile / ~128px desktop
    return (
        <main className={`min-h-screen ${isAuthPage ? '' : 'pt-[100px] md:pt-[128px]'}`}>
            {children}
        </main>
    )
}

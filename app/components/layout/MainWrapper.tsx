'use client'

import { usePathname } from 'next/navigation'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Don't add top padding for auth pages since navbar is hidden there
    const isAuthPage = pathname?.startsWith('/auth/')

    return (
        <main className={`min-h-screen ${isAuthPage ? '' : 'pt-[72px] md:pt-[100px]'}`}>
            {children}
        </main>
    )
}

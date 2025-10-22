'use client'

import Link from 'next/link'
import { UserButton } from '@/components/auth'
import { Music } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Music className="h-6 w-6" />
          <span className="font-bold text-xl">Vibe-Song</span>
        </Link>

        {/* User Button */}
        <UserButton />
      </div>
    </header>
  )
}

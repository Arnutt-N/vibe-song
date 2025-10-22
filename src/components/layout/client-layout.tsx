'use client'

import { AudioPlayer } from '@/components/player'
import { Header } from './header'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Header */}
      <Header />

      {/* Main Content with padding for fixed player */}
      <div className="pb-24">
        {children}
      </div>

      {/* Fixed Audio Player */}
      <AudioPlayer />
    </>
  )
}

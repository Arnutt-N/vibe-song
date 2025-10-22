'use client'

import { AudioPlayer } from '@/components/player'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Main Content with padding for fixed player */}
      <div className="pb-24">
        {children}
      </div>

      {/* Fixed Audio Player */}
      <AudioPlayer />
    </>
  )
}

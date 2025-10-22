'use client'

import { useState } from 'react'
import { User, LogOut, Heart, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuthModal } from './auth-modal'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store'

export function UserButton() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { signOut } = useAuth()
  const { user, profile, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="h-5 w-5" />
      </Button>
    )
  }

  if (!user) {
    return (
      <>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowAuthModal(true)}
        >
          Sign In
        </Button>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
        />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.displayName || 'My Account'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email || user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Heart className="mr-2 h-4 w-4" />
          <span>Saved Tracks</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <History className="mr-2 h-4 w-4" />
          <span>Listening History</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

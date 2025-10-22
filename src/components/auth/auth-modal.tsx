'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SignUpForm } from './sign-up-form'
import { LoginForm } from './login-form'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultView?: 'login' | 'signup'
}

export function AuthModal({ open, onOpenChange, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(defaultView)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {view === 'login' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
          <DialogDescription>
            {view === 'login'
              ? 'Sign in to save your favorite tracks and listening history'
              : 'Sign up to start building your personalized music collection'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {view === 'login' ? (
            <LoginForm
              onSuccess={() => onOpenChange(false)}
              onSwitchToSignUp={() => setView('signup')}
            />
          ) : (
            <SignUpForm
              onSuccess={() => onOpenChange(false)}
              onSwitchToLogin={() => setView('login')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

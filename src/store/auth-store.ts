import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isAnonymous: boolean
}

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (isLoading: boolean) => void
  reset: () => void
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAnonymous: true,
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setSession: (session) => set({ session }),

      setProfile: (profile) => set({
        profile,
        isAnonymous: profile?.isAnonymous ?? true,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      reset: () => set(initialState),
    }),
    {
      name: 'AuthStore',
    }
  )
)

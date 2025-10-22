'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()
  const { user, setUser, setSession, setProfile, setLoading, reset } = useAuthStore()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          setUser(session.user)
          setSession(session)

          // Fetch user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setProfile({
              id: profile.id,
              email: profile.email,
              displayName: profile.display_name,
              avatarUrl: profile.avatar_url,
              isAnonymous: profile.is_anonymous,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            })
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          setSession(session)

          // Fetch profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setProfile({
              id: profile.id,
              email: profile.email,
              displayName: profile.display_name,
              avatarUrl: profile.avatar_url,
              isAnonymous: profile.is_anonymous,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            })
          }
        } else if (event === 'SIGNED_OUT') {
          reset()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser, setSession, setProfile, setLoading, reset])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    reset()
    router.push('/')
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  return {
    user,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
  }
}

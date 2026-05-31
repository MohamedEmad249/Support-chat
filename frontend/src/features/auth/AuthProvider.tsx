import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { ApiError, apiFetch, publicApiFetch } from '../../lib/apiClient'
import { supabase } from '../../lib/supabaseClient'
import { queryClient } from '../../app/queryClient'
import type { UserProfile } from '../conversations/types'

type AuthContextValue = {
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  profileError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ session: Session | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ROLE_LABELS: Record<UserProfile['role'], string> = {
  student: 'Student',
  sales: 'Sales Agent',
  manager: 'Manager',
}

export function roleLabel(role: UserProfile['role'] | undefined): string {
  if (!role) return 'Unknown'
  return ROLE_LABELS[role] ?? role
}

async function fetchProfile(accessToken: string): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/me', {}, accessToken)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const bootstrapped = useRef(false)

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession)

    if (!nextSession) {
      setProfile(null)
      setProfileError(null)
      return
    }

    try {
      const me = await fetchProfile(nextSession.access_token)
      setProfile(me)
      setProfileError(null)
    } catch (err) {
      setProfile(null)
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not load your profile'
      setProfileError(message)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setProfile(null)
      setProfileError('Not signed in')
      return
    }
    await applySession(data.session)
  }, [applySession])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      await applySession(data.session)
      if (mounted) {
        bootstrapped.current = true
        setLoading(false)
      }
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return
      if (event === 'INITIAL_SESSION' && bootstrapped.current) return

      if (nextSession) {
        setLoading(true)
        await applySession(nextSession)
        if (mounted) setLoading(false)
      } else {
        setSession(null)
        setProfile(null)
        setProfileError(null)
        if (mounted) setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [applySession])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) throw error
      if (!data.session) throw new Error('Sign in succeeded but no session was returned')

      setLoading(true)
      await applySession(data.session)
      setLoading(false)
    },
    [applySession],
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const normalizedEmail = email.trim().toLowerCase()
      const trimmedName = fullName.trim()

      // Call our worker sign-up API which uses the Admin API to auto-confirm the user
      await publicApiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password, fullName: trimmedName }),
      })

      // Log in immediately since the user is auto-confirmed!
      await signIn(normalizedEmail, password)
    },
    [signIn],
  )

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    queryClient.clear()
    await supabase.auth.signOut({ scope: 'local' })
    setSession(null)
    setProfile(null)
    setProfileError(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      profileError,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, profileError, signIn, signUp, signInWithGoogle, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
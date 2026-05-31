import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { api, setToken } from '../../lib/apiClient'

export type Profile = {
  id: string
  full_name: string
  role: 'student' | 'sales' | 'manager'
  created_at: string
}

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; profile: Profile }

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' })
  const loadingProfile = useRef(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setToken(null)
          loadingProfile.current = false
          setState({ status: 'unauthenticated' })
          return
        }

        // Ignore duplicate events while already loading
        if (loadingProfile.current) return
        loadingProfile.current = true

        setToken(session.access_token)

        try {
          const profile = await api.get<Profile>('/api/me')
          setState({ status: 'authenticated', profile })
        } catch (err) {
          console.error('Failed to load profile:', err)
          setState({ status: 'unauthenticated' })
        } finally {
          loadingProfile.current = false
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    setToken(null)
    await supabase.auth.signOut()
    setState({ status: 'unauthenticated' })
  }

  return { state, signOut }
}
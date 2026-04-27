import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) {
      setProfile(data)
      return
    }

    // Profile missing (e.g. signup happened with email confirmation enabled).
    // Create it now so onboarding can proceed. Use maybeSingle on the insert
    // result and fall back to a fresh SELECT if a concurrent call beat us to it.
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: userId, total_xp: 0, onboarding_complete: false })
      .select()
      .maybeSingle()

    if (created) {
      setProfile(created)
    } else {
      // INSERT was lost to a concurrent call (e.g. React StrictMode double-mount).
      // Fetch the row that the other call created.
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      setProfile(existing ?? null)
    }
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    // Safety valve: if Supabase never responds (network hang), unblock the UI
    // after 10 s so the user isn't permanently stuck on the loading screen.
    const timeout = setTimeout(() => setLoading(false), 10_000)

    // Resolve initial session via a direct promise so loading always clears,
    // even if the onAuthStateChange INITIAL_SESSION event is delayed or dropped.
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

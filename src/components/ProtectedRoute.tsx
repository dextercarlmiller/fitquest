import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function LoadingScreen() {
  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🍄</div>
        <p className="font-pixel text-green-400 text-xs">Loading...</p>
      </div>
    </div>
  )
}

function ProfileErrorScreen() {
  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="font-pixel text-red-400 text-xs mb-3">Profile unavailable</p>
        <p className="text-gray-400 text-sm mb-6">Could not load your profile data.</p>
        <div className="flex flex-col gap-3 items-center">
          <button onClick={() => window.location.reload()} className="btn-primary w-40">
            Retry
          </button>
          <button onClick={() => window.location.href = '/onboarding'} className="btn-secondary w-40">
            Complete Setup
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <ProfileErrorScreen />
  if (!profile.onboarding_complete) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

export function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.onboarding_complete) return <Navigate to="/" replace />

  return <>{children}</>
}

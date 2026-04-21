import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <LoadingScreen />
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

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      navigate(profile?.onboarding_complete ? '/' : '/onboarding', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [user, profile, loading, navigate])

  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🍄</div>
        <p className="font-pixel text-green-400 text-xs">Authenticating...</p>
      </div>
    </div>
  )
}

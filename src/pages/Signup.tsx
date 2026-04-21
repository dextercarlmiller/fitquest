import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user && data.session) {
      // Email confirmation is disabled — user is immediately signed in
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        total_xp: 0,
        onboarding_complete: false,
      })
      if (profileError) {
        setError('Account created but profile setup failed. Please try signing in.')
        setLoading(false)
        return
      }
      navigate('/onboarding')
    } else if (data.user && !data.session) {
      // Email confirmation is enabled — user must confirm before signing in
      setEmailSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-screen px-6">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">⚔️</div>
        <h1 className="font-pixel text-green-400 text-lg leading-loose">FitQuest</h1>
        <p className="text-gray-400 text-sm mt-2">Begin your adventure</p>
      </div>

      {/* Email confirmation notice */}
      {emailSent && (
        <div className="w-full max-w-sm">
          <div className="card p-6 text-center space-y-4">
            <div className="text-4xl">📬</div>
            <h2 className="font-pixel text-green-400 text-xs">Check Your Email</h2>
            <p className="text-gray-400 text-sm">
              We sent a confirmation link to <span className="text-white">{email}</span>.
              Click it to activate your account, then sign in.
            </p>
            <Link to="/login" className="btn-primary block w-full text-center">
              Go to Login
            </Link>
          </div>
        </div>
      )}

      {/* Form */}
      {!emailSent && <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="font-pixel text-green-400 text-xs mb-4">Create Account</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="hero@quest.com"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Start Quest'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 transition-colors">
            Log in
          </Link>
        </p>
      </div>}
    </div>
  )
}

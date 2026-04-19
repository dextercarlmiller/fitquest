import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Goal, ActivityLevel } from '../lib/types'

const GOALS: { value: Goal; label: string; emoji: string; description: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight', emoji: '🔥', description: 'Burn fat & feel lighter' },
  { value: 'build_strength', label: 'Build Strength', emoji: '💪', description: 'Get stronger & build muscle' },
  { value: 'move_more', label: 'Move More', emoji: '🚶', description: 'General fitness & health' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; emoji: string }[] = [
  { value: 'not_at_all', label: 'Not at all', emoji: '🛋️' },
  { value: 'a_little', label: 'A little', emoji: '🚶' },
  { value: 'somewhat_active', label: 'Somewhat active', emoji: '🏃' },
]

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i + 1 === current ? 'bg-green-400 w-6' : i + 1 < current ? 'bg-green-700' : 'bg-gray-700'
            }`}
          />
        </div>
      ))}
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [currentWeight, setCurrentWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [age, setAge] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null)
  const [loading, setLoading] = useState(false)

  const handleStep1 = () => {
    if (!goal) return
    setStep(2)
  }

  const handleStep2 = async () => {
    if (!activityLevel || !user) return
    setLoading(true)

    await supabase.from('profiles').upsert({
      id: user.id,
      goal,
      current_weight: currentWeight ? parseFloat(currentWeight) : null,
      goal_weight: goalWeight ? parseFloat(goalWeight) : null,
      age: age ? parseInt(age) : null,
      activity_level: activityLevel,
      total_xp: 0,
      onboarding_complete: false,
    })

    setLoading(false)
    setStep(3)
  }

  const handleBegin = async () => {
    if (!user) return
    setLoading(true)

    await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id)
    await refreshProfile()
    navigate('/')
  }

  return (
    <div className="page-container min-h-screen px-6 py-10">
      <StepIndicator current={step} total={3} />

      {/* Step 1: Goal Selection */}
      {step === 1 && (
        <div className="animate-slide-in">
          <h1 className="font-pixel text-green-400 text-sm leading-loose mb-2">Choose Your Quest</h1>
          <p className="text-gray-400 text-sm mb-8">What's your main fitness goal?</p>

          <div className="space-y-3 mb-10">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`w-full card p-4 flex items-center gap-4 text-left transition-all duration-150 ${
                  goal === g.value
                    ? 'border-green-400 bg-green-900/20 glow-green-sm'
                    : 'hover:border-green-800'
                }`}
              >
                <span className="text-3xl">{g.emoji}</span>
                <div>
                  <p className="font-pixel text-white" style={{ fontSize: '0.6rem' }}>{g.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{g.description}</p>
                </div>
                {goal === g.value && (
                  <span className="ml-auto text-green-400 text-lg">✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleStep1}
            disabled={!goal}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2: Basic Info */}
      {step === 2 && (
        <div className="animate-slide-in">
          <h1 className="font-pixel text-green-400 text-sm leading-loose mb-2">Your Stats</h1>
          <p className="text-gray-400 text-sm mb-8">All fields are optional — fill in what you know!</p>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Current Weight (lbs)</label>
                <input
                  type="number"
                  value={currentWeight}
                  onChange={e => setCurrentWeight(e.target.value)}
                  placeholder="175"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              {goal === 'lose_weight' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Goal Weight (lbs)</label>
                  <input
                    type="number"
                    value={goalWeight}
                    onChange={e => setGoalWeight(e.target.value)}
                    placeholder="155"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="29"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-3">How active are you right now?</label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map(a => (
                  <button
                    key={a.value}
                    onClick={() => setActivityLevel(a.value)}
                    className={`w-full card p-3 flex items-center gap-3 text-left transition-all duration-150 ${
                      activityLevel === a.value
                        ? 'border-green-400 bg-green-900/20'
                        : 'hover:border-green-800'
                    }`}
                  >
                    <span className="text-xl">{a.emoji}</span>
                    <span className="text-sm text-white">{a.label}</span>
                    {activityLevel === a.value && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              ← Back
            </button>
            <button
              onClick={handleStep2}
              disabled={!activityLevel || loading}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Next →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Welcome */}
      {step === 3 && (
        <div className="animate-slide-in text-center">
          <div className="text-8xl mb-6 animate-bounce">🧙</div>
          <h1 className="font-pixel text-green-400 text-sm leading-loose mb-3">
            Hero Created!
          </h1>
          <p className="text-gray-300 text-sm mb-2">Your adventure begins in</p>
          <div className="card p-4 mb-8 inline-block">
            <p className="font-pixel text-yellow-400 text-xs">🍄 Zone 1: Mushroom Plains</p>
          </div>

          <div className="space-y-3 mb-10 text-left">
            <div className="card p-4 flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-pixel text-white" style={{ fontSize: '0.5rem' }}>Log Daily Activity</p>
                <p className="text-gray-400 text-xs mt-1">Earn XP for every workout, step, and healthy habit</p>
              </div>
            </div>
            <div className="card p-4 flex items-start gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="font-pixel text-white" style={{ fontSize: '0.5rem' }}>Complete Weekly Quests</p>
                <p className="text-gray-400 text-xs mt-1">Special challenges reset every Monday for bonus XP</p>
              </div>
            </div>
            <div className="card p-4 flex items-start gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <p className="font-pixel text-white" style={{ fontSize: '0.5rem' }}>Unlock New Zones</p>
                <p className="text-gray-400 text-xs mt-1">Level up to explore new worlds on your map</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleBegin}
            disabled={loading}
            className="btn-primary w-full text-base disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Begin Your Quest!'}
          </button>
        </div>
      )}
    </div>
  )
}

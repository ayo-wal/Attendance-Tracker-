import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)

    if (mode === 'forgot') {
      try {
        const res = await fetch('/.netlify/functions/request-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        setBusy(false)
        if (!res.ok) setError(data.error || 'Something went wrong.')
        else setInfo(data.message)
      } catch {
        setBusy(false)
        setError('Something went wrong. Please try again.')
      }
      return
    }

    const { error } =
      mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setInfo('Account created. Check your inbox to confirm your email, then sign in.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center blueprint-grid px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-mono text-xs tracking-widest text-accent uppercase mb-1">
            Ayo-Wal
          </div>
          <h1 className="font-display text-2xl font-semibold">Attendance Tracker</h1>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          {mode !== 'forgot' && (
            <div className="flex mb-6 rounded-lg bg-surface-2 p-1 text-sm font-medium">
              <button
                className={`flex-1 rounded-md py-1.5 transition ${mode === 'signin' ? 'bg-accent text-bg' : 'text-muted'}`}
                onClick={() => {
                  setMode('signin')
                  setError('')
                  setInfo('')
                }}
                type="button"
              >
                Sign in
              </button>
              <button
                className={`flex-1 rounded-md py-1.5 transition ${mode === 'signup' ? 'bg-accent text-bg' : 'text-muted'}`}
                onClick={() => {
                  setMode('signup')
                  setError('')
                  setInfo('')
                }}
                type="button"
              >
                Sign up
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-4">
              <h2 className="font-display font-semibold">Reset your password</h2>
              <p className="text-xs text-muted mt-1">
                Enter your account email and we'll send you a link to set a new password.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="you@student.ruet.ac.bd"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs text-muted mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgot')
                  setError('')
                  setInfo('')
                }}
                className="text-xs text-accent hover:opacity-80 transition -mt-2"
              >
                Forgot password?
              </button>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}
            {info && <p className="text-sm text-safe">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-accent text-bg font-medium py-2 text-sm hover:bg-accent-dim transition disabled:opacity-50"
            >
              {busy
                ? 'Working…'
                : mode === 'signin'
                  ? 'Sign in'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Send reset link'}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError('')
                  setInfo('')
                }}
                className="w-full text-xs text-muted hover:text-text transition"
              >
                ← Back to sign in
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

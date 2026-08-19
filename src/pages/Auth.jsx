import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
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
            Mecha Verse
          </div>
          <h1 className="font-display text-2xl font-semibold">Attendance Tracker</h1>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex mb-6 rounded-lg bg-surface-2 p-1 text-sm font-medium">
            <button
              className={`flex-1 rounded-md py-1.5 transition ${mode === 'signin' ? 'bg-accent text-bg' : 'text-muted'}`}
              onClick={() => setMode('signin')}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`flex-1 rounded-md py-1.5 transition ${mode === 'signup' ? 'bg-accent text-bg' : 'text-muted'}`}
              onClick={() => setMode('signup')}
              type="button"
            >
              Sign up
            </button>
          </div>

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

            {error && <p className="text-sm text-danger">{error}</p>}
            {info && <p className="text-sm text-safe">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-accent text-bg font-medium py-2 text-sm hover:bg-accent-dim transition disabled:opacity-50"
            >
              {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

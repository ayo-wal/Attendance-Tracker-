import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/.netlify/functions/verify-and-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      setBusy(false)
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setDone(true)
        setTimeout(() => navigate('/auth'), 2000)
      }
    } catch {
      setBusy(false)
      setError('Something went wrong. Please try again.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center blueprint-grid px-4">
        <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted mb-3">
            This reset link is missing its token. Request a new one from the sign-in page.
          </p>
          <Link to="/auth" className="text-xs text-accent hover:opacity-80 transition">
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center blueprint-grid px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-mono text-xs tracking-widest text-accent uppercase mb-1">Ayo-Wal</div>
          <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          {done ? (
            <p className="text-sm text-safe text-center">Password updated. Taking you to sign in…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">New password</label>
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
              <div>
                <label className="block text-xs text-muted mb-1">Confirm new password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-accent text-bg font-medium py-2 text-sm hover:bg-accent-dim transition disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

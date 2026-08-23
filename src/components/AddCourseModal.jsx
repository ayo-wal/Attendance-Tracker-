import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { computeTotalClasses } from '../lib/attendanceMath'
import { CURRICULUM, SEMESTER_NAMES } from '../lib/curriculum'

export default function AddCourseModal({ onClose, onCreated }) {
  const [tab, setTab] = useState('semester') // 'semester' | 'manual'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 max-h-[85vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold mb-4">Add course</h2>

        <div className="flex mb-5 rounded-lg bg-surface-2 p-1 text-sm font-medium">
          <button
            className={`flex-1 rounded-md py-1.5 transition ${tab === 'semester' ? 'bg-accent text-bg' : 'text-muted'}`}
            onClick={() => setTab('semester')}
            type="button"
          >
            From my semester
          </button>
          <button
            className={`flex-1 rounded-md py-1.5 transition ${tab === 'manual' ? 'bg-accent text-bg' : 'text-muted'}`}
            onClick={() => setTab('manual')}
            type="button"
          >
            Add manually
          </button>
        </div>

        {tab === 'semester' ? (
          <SemesterTab onClose={onClose} onCreated={onCreated} />
        ) : (
          <ManualTab onClose={onClose} onCreated={onCreated} />
        )}
      </div>
    </div>
  )
}

function SemesterTab({ onClose, onCreated }) {
  const { user } = useAuth()
  const [semester, setSemester] = useState('')
  const [selected, setSelected] = useState({}) // code -> bool
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function pickSemester(s) {
    setSemester(s)
    const initial = {}
    CURRICULUM[s].forEach((c) => {
      initial[c.code] = !c.untrack // pre-check everything except Project/Seminar/Training
    })
    setSelected(initial)
  }

  function toggle(code) {
    setSelected((prev) => ({ ...prev, [code]: !prev[code] }))
  }

  async function handleAdd() {
    const courses = CURRICULUM[semester].filter((c) => selected[c.code])
    if (courses.length === 0) return
    setBusy(true)
    setError('')

    const rows = courses.map((c) => ({
      user_id: user.id,
      name: c.name,
      code: c.code,
      course_type: c.type,
      credit: c.credit,
      total_classes: computeTotalClasses(c.type, c.credit),
      tracking_mode: 'quick',
      manual_absences: 0,
      target_percent: 75,
    }))

    const { error } = await supabase.from('courses').insert(rows)
    setBusy(false)
    if (error) {
      setError(error.message)
    } else {
      onCreated()
      onClose()
    }
  }

  if (!semester) {
    return (
      <div>
        <p className="text-sm text-muted mb-3">
          Pick your current semester — RUET ME's course list loads automatically with the right
          credit hours.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SEMESTER_NAMES.map((s) => (
            <button
              key={s}
              onClick={() => pickSemester(s)}
              className="rounded-lg border border-border bg-surface-2 py-3 text-sm font-medium hover:border-accent transition"
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-4">
          Not ME, or your courses differ? Use "Add manually" instead.
        </p>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => setSemester('')} className="text-xs text-muted hover:text-text mb-3 transition">
        ← Change semester
      </button>
      <p className="text-sm font-medium mb-2">{semester}</p>
      <p className="text-xs text-muted mb-3">
        Uncheck anything you don't want tracked. Everything starts in "quick" mode — just tap +1
        when you miss a class.
      </p>

      <div className="space-y-1.5 max-h-64 overflow-y-auto mb-4">
        {CURRICULUM[semester].map((c) => (
          <label
            key={c.code}
            className="flex items-center gap-3 rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!selected[c.code]}
              onChange={() => toggle(c.code)}
              className="accent-[var(--color-accent)]"
            />
            <div className="flex-1 min-w-0">
              <div className="truncate">{c.name}</div>
              <div className="text-xs text-muted font-mono">
                {c.code} · {c.credit} credit · {c.type} · {computeTotalClasses(c.type, c.credit)} classes
              </div>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-danger mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-border py-2 text-sm text-muted hover:text-text transition"
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={busy}
          className="flex-1 rounded-lg bg-accent text-bg font-medium py-2 text-sm hover:bg-accent-dim transition disabled:opacity-50"
        >
          {busy ? 'Adding…' : `Add ${Object.values(selected).filter(Boolean).length} courses`}
        </button>
      </div>
    </div>
  )
}

function ManualTab({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [courseType, setCourseType] = useState('theory')
  const [credit, setCredit] = useState(3)
  const [trackingMode, setTrackingMode] = useState('quick')
  const [target, setTarget] = useState(75)
  const [teacher1, setTeacher1] = useState('')
  const [teacher2, setTeacher2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const totalClasses = computeTotalClasses(courseType, credit)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      name,
      code,
      course_type: courseType,
      credit,
      total_classes: totalClasses,
      tracking_mode: trackingMode,
      manual_absences: 0,
      target_percent: target,
      teacher1: teacher1 || null,
      teacher2: teacher2 || null,
    })
    setBusy(false)
    if (error) {
      setError(error.message)
    } else {
      onCreated()
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-muted mb-1">Course name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mechanics of Solids"
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">Course code (optional)</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ME 2209"
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Type</label>
          <select
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
            className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="theory">Theory</option>
            <option value="sessional">Sessional / Lab</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Credit</label>
          <input
            type="number"
            step="0.25"
            min="0.25"
            value={credit}
            onChange={(e) => setCredit(Number(e.target.value))}
            className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
      <p className="text-xs text-muted -mt-2">→ {totalClasses} total classes this semester</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Teacher 1 (optional)</label>
          <input
            value={teacher1}
            onChange={(e) => setTeacher1(e.target.value)}
            placeholder="Dr. Rahman"
            className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Teacher 2 (optional)</label>
          <input
            value={teacher2}
            onChange={(e) => setTeacher2(e.target.value)}
            placeholder="Dr. Islam"
            className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Required attendance %</label>
        <input
          type="number"
          min={1}
          max={100}
          required
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Tracking style</label>
        <div className="flex rounded-lg bg-surface-2 p-1 text-sm">
          <button
            type="button"
            onClick={() => setTrackingMode('quick')}
            className={`flex-1 rounded-md py-1.5 transition ${trackingMode === 'quick' ? 'bg-accent text-bg' : 'text-muted'}`}
          >
            Quick (just count absences)
          </button>
          <button
            type="button"
            onClick={() => setTrackingMode('detailed')}
            className={`flex-1 rounded-md py-1.5 transition ${trackingMode === 'detailed' ? 'bg-accent text-bg' : 'text-muted'}`}
          >
            Detailed (log each class)
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-border py-2 text-sm text-muted hover:text-text transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-lg bg-accent text-bg font-medium py-2 text-sm hover:bg-accent-dim transition disabled:opacity-50"
        >
          {busy ? 'Adding…' : 'Add course'}
        </button>
      </div>
    </form>
  )
}

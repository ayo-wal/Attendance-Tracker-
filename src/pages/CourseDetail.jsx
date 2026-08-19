import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import AttendanceGauge from '../components/AttendanceGauge'
import { summarize, projection } from '../lib/attendanceMath'

const STATUS_STYLES = {
  present: 'bg-safe/15 text-safe border-safe/30',
  absent: 'bg-danger/15 text-danger border-danger/30',
  cancelled: 'bg-muted/15 text-muted border-border',
}

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    const [{ data: courseData }, { data: recordData }] = await Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase
        .from('attendance_records')
        .select('*')
        .eq('course_id', id)
        .order('class_date', { ascending: false }),
    ])
    setCourse(courseData ?? null)
    setRecords(recordData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function logStatus(status) {
    setBusy(true)
    setError('')
    const { error } = await supabase.from('attendance_records').insert({
      course_id: id,
      user_id: user.id,
      class_date: date,
      status,
    })
    setBusy(false)
    if (error) setError(error.message)
    else loadData()
  }

  async function deleteRecord(recordId) {
    await supabase.from('attendance_records').delete().eq('id', recordId)
    loadData()
  }

  async function deleteCourse() {
    if (!confirm(`Delete "${course.name}" and all its attendance records? This can't be undone.`)) return
    await supabase.from('courses').delete().eq('id', id)
    window.location.href = '/'
  }

  if (loading) return <div className="p-6 text-muted text-sm">Loading…</div>
  if (!course) return <div className="p-6 text-muted text-sm">Course not found.</div>

  const { present, absent, cancelled, total, percent } = summarize(records)
  const proj = projection(present, total, course.target_percent)

  return (
    <div className="min-h-screen blueprint-grid">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs text-muted hover:text-text transition">
            ← Back
          </Link>
          <button onClick={deleteCourse} className="text-xs text-danger hover:opacity-80 transition">
            Delete course
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-2">
          {course.code && (
            <div className="font-mono text-xs text-muted uppercase tracking-wide">{course.code}</div>
          )}
          <h1 className="font-display text-2xl font-semibold">{course.name}</h1>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 my-5 flex flex-col sm:flex-row items-center gap-6">
          <AttendanceGauge percent={percent} target={course.target_percent} size={170} />
          <div className="flex-1 w-full space-y-2 text-sm">
            <Row label="Present" value={present} color="text-safe" />
            <Row label="Absent" value={absent} color="text-danger" />
            <Row label="Cancelled (not counted)" value={cancelled} color="text-muted" />
            <div
              className={`rounded-lg px-3 py-2 mt-3 font-medium ${
                total === 0 ? 'bg-surface-2 text-muted' : proj.type === 'safe' ? 'bg-safe/10 text-safe' : 'bg-danger/10 text-danger'
              }`}
            >
              {total === 0
                ? 'Log your first class below'
                : proj.type === 'safe'
                  ? proj.value === 0
                    ? "Right at the edge — don't miss the next one"
                    : `You can safely skip ${proj.value} more class${proj.value === 1 ? '' : 'es'}`
                  : `Attend the next ${proj.value} class${proj.value === 1 ? '' : 'es'} in a row to hit ${course.target_percent}%`}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <h2 className="font-display font-semibold mb-3">Log a class</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="flex gap-2 flex-1">
              <button
                disabled={busy}
                onClick={() => logStatus('present')}
                className="flex-1 rounded-lg bg-safe/15 text-safe border border-safe/30 py-2 text-sm font-medium hover:bg-safe/25 transition disabled:opacity-50"
              >
                Present
              </button>
              <button
                disabled={busy}
                onClick={() => logStatus('absent')}
                className="flex-1 rounded-lg bg-danger/15 text-danger border border-danger/30 py-2 text-sm font-medium hover:bg-danger/25 transition disabled:opacity-50"
              >
                Absent
              </button>
              <button
                disabled={busy}
                onClick={() => logStatus('cancelled')}
                className="flex-1 rounded-lg bg-muted/15 text-muted border border-border py-2 text-sm font-medium hover:bg-muted/25 transition disabled:opacity-50"
              >
                Cancelled
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-danger mt-2">{error}</p>}
        </div>

        <h2 className="font-display font-semibold mb-3">History</h2>
        {records.length === 0 ? (
          <p className="text-muted text-sm">No classes logged yet.</p>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2.5"
              >
                <span className="font-mono text-sm text-muted">{r.class_date}</span>
                <span className={`text-xs rounded-full border px-2.5 py-1 font-medium ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
                <button
                  onClick={() => deleteRecord(r.id)}
                  className="text-xs text-muted hover:text-danger transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-mono font-medium ${color}`}>{value}</span>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import AttendanceGauge from '../components/AttendanceGauge'
import { summarizeCourse, summarizeRecords, projection, computeTotalClasses } from '../lib/attendanceMath'

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
  const [teacher, setTeacher] = useState('')
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
      teacher: teacher || null,
    })
    setBusy(false)
    if (error) setError(error.message)
    else loadData()
  }

  async function deleteRecord(recordId) {
    await supabase.from('attendance_records').delete().eq('id', recordId)
    loadData()
  }

  async function adjustAbsences(delta) {
    const total = course.total_classes || computeTotalClasses(course.course_type, course.credit)
    const next = Math.max(0, Math.min(total, (course.manual_absences || 0) + delta))
    setCourse({ ...course, manual_absences: next }) // optimistic
    const { error } = await supabase.from('courses').update({ manual_absences: next }).eq('id', id)
    if (error) setError(error.message)
  }

  async function switchMode(mode) {
    setBusy(true)
    const { error } = await supabase.from('courses').update({ tracking_mode: mode }).eq('id', id)
    setBusy(false)
    if (error) setError(error.message)
    else loadData()
  }

  async function deleteCourse() {
    if (!confirm(`Delete "${course.name}" and all its attendance records? This can't be undone.`)) return
    await supabase.from('courses').delete().eq('id', id)
    window.location.href = '/'
  }

  if (loading) return <div className="p-6 text-muted text-sm">Loading…</div>
  if (!course) return <div className="p-6 text-muted text-sm">Course not found.</div>

  const isQuick = course.tracking_mode === 'quick'
  const { present, absent, cancelled, total, percent } = summarizeCourse(course, records)
  const proj = projection(present, total, course.target_percent)
  const teacherOptions = [course.teacher1, course.teacher2].filter(Boolean)

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
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            {course.code && (
              <div className="font-mono text-xs text-muted uppercase tracking-wide">{course.code}</div>
            )}
            <h1 className="font-display text-2xl font-semibold">{course.name}</h1>
            {teacherOptions.length > 0 && (
              <p className="text-xs text-muted mt-1">{teacherOptions.join(' · ')}</p>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 my-5 flex flex-col sm:flex-row items-center gap-6">
          <AttendanceGauge percent={percent} target={course.target_percent} size={170} />
          <div className="flex-1 w-full space-y-2 text-sm">
            <Row label="Present" value={present} color="text-safe" />
            <Row label="Absent" value={absent} color="text-danger" />
            {!isQuick && <Row label="Cancelled (not counted)" value={cancelled} color="text-muted" />}
            {isQuick && <Row label="Total classes this semester" value={total} color="text-text" />}
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

        {/* tracking mode toggle */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="text-muted">
            Tracking style: <span className="text-text font-medium">{isQuick ? 'Quick' : 'Detailed'}</span>
          </span>
          <button
            disabled={busy}
            onClick={() => switchMode(isQuick ? 'detailed' : 'quick')}
            className="text-accent hover:opacity-80 transition disabled:opacity-50"
          >
            Switch to {isQuick ? 'detailed logging' : 'quick mode'}
          </button>
        </div>

        {isQuick ? (
          <div className="bg-surface border border-border rounded-xl p-5 mb-6">
            <h2 className="font-display font-semibold mb-1">Absences this semester</h2>
            <p className="text-xs text-muted mb-4">
              Out of {course.total_classes || computeTotalClasses(course.course_type, course.credit)} total
              classes ({course.credit} credit {course.course_type}). Just tap +1 whenever you miss one.
            </p>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => adjustAbsences(-1)}
                disabled={busy || (course.manual_absences || 0) === 0}
                className="w-12 h-12 rounded-full bg-surface-2 border border-border text-xl font-bold hover:border-accent transition disabled:opacity-40"
              >
                −
              </button>
              <div className="text-center">
                <div className="font-mono text-4xl font-bold text-danger">{course.manual_absences || 0}</div>
                <div className="text-xs text-muted">absences</div>
              </div>
              <button
                onClick={() => adjustAbsences(1)}
                disabled={busy}
                className="w-12 h-12 rounded-full bg-danger/15 border border-danger/30 text-danger text-xl font-bold hover:bg-danger/25 transition disabled:opacity-40"
              >
                +
              </button>
            </div>
            {error && <p className="text-sm text-danger mt-3 text-center">{error}</p>}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-5 mb-6">
            <h2 className="font-display font-semibold mb-3">Log a class</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                />
                {teacherOptions.length > 0 ? (
                  <select
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="flex-1 rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    <option value="">No teacher noted</option>
                    {teacherOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    placeholder="Teacher (optional)"
                    className="flex-1 rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                )}
              </div>
              <div className="flex gap-2">
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
        )}

        {!isQuick && (
          <>
            <h2 className="font-display font-semibold mb-3">History</h2>
            {records.length === 0 ? (
              <p className="text-muted text-sm">No classes logged yet.</p>
            ) : (
              <div className="space-y-2">
                {records.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2.5 gap-3"
                  >
                    <span className="font-mono text-sm text-muted shrink-0">{r.class_date}</span>
                    <span className={`text-xs rounded-full border px-2.5 py-1 font-medium shrink-0 ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    {r.teacher && <span className="text-xs text-muted truncate flex-1">{r.teacher}</span>}
                    <button
                      onClick={() => deleteRecord(r.id)}
                      className="text-xs text-muted hover:text-danger transition shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
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

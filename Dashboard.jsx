import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import CourseCard from '../components/CourseCard'
import AddCourseModal from '../components/AddCourseModal'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [courses, setCourses] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  async function loadData() {
    setLoading(true)
    const [{ data: courseData }, { data: recordData }] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: true }),
      supabase.from('attendance_records').select('*'),
    ])
    setCourses(courseData ?? [])
    setRecords(recordData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen blueprint-grid">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-xs tracking-widest text-accent uppercase">Mecha Verse</div>
            <h1 className="font-display text-xl font-semibold">Attendance</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted hover:text-text transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">Your courses</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-accent text-bg text-sm font-medium px-4 py-2 hover:bg-accent-dim transition"
          >
            + Add course
          </button>
        </div>

        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <p className="text-muted text-sm mb-4">No courses yet. Add your first one to start tracking.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-lg bg-accent text-bg text-sm font-medium px-4 py-2 hover:bg-accent-dim transition"
            >
              + Add course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                records={records.filter((r) => r.course_id === course.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && <AddCourseModal onClose={() => setShowAdd(false)} onCreated={loadData} />}
    </div>
  )
}

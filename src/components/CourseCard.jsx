import { Link } from 'react-router-dom'
import AttendanceGauge from './AttendanceGauge'
import { summarizeCourse, projection } from '../lib/attendanceMath'

export default function CourseCard({ course, records }) {
  const { present, absent, total, percent } = summarizeCourse(course, records)
  const proj = projection(present, total, course.target_percent)

  return (
    <Link
      to={`/course/${course.id}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-accent transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0">
          {course.code && (
            <div className="font-mono text-xs text-muted uppercase tracking-wide">{course.code}</div>
          )}
          <h3 className="font-display font-semibold leading-tight truncate">{course.name}</h3>
        </div>
        <span className="shrink-0 text-[10px] uppercase tracking-wide rounded-full border border-border px-2 py-0.5 text-muted">
          {course.tracking_mode === 'quick' ? 'Quick' : 'Detailed'}
        </span>
      </div>

      <div className="flex items-center justify-center py-2">
        <AttendanceGauge percent={percent} target={course.target_percent} size={140} />
      </div>

      <div className="flex justify-between text-xs text-muted mt-2 mb-3">
        <span>
          {present}/{total} classes attended
        </span>
        {(course.teacher1 || course.teacher2) && (
          <span className="truncate max-w-[55%] text-right">
            {[course.teacher1, course.teacher2].filter(Boolean).join(' / ')}
          </span>
        )}
      </div>

      <div
        className={`text-xs rounded-lg px-3 py-2 text-center font-medium ${
          total === 0
            ? 'bg-surface-2 text-muted'
            : proj.type === 'safe'
              ? 'bg-safe/10 text-safe'
              : 'bg-danger/10 text-danger'
        }`}
      >
        {total === 0
          ? 'No classes logged yet'
          : proj.type === 'safe'
            ? proj.value === 0
              ? 'Right at the edge — don\u2019t miss the next one'
              : `Can safely skip ${proj.value} more`
            : `Attend next ${proj.value} in a row to hit target`}
      </div>
    </Link>
  )
}

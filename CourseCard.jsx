import { Link } from 'react-router-dom'
import AttendanceGauge from './AttendanceGauge'
import { summarize, projection } from '../lib/attendanceMath'

export default function CourseCard({ course, records }) {
  const { present, absent, total, percent } = summarize(records)
  const proj = projection(present, total, course.target_percent)

  return (
    <Link
      to={`/course/${course.id}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-accent transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          {course.code && (
            <div className="font-mono text-xs text-muted uppercase tracking-wide">{course.code}</div>
          )}
          <h3 className="font-display font-semibold leading-tight">{course.name}</h3>
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <AttendanceGauge percent={percent} target={course.target_percent} size={140} />
      </div>

      <div className="flex justify-between text-xs text-muted mt-2 mb-3">
        <span>
          {present}/{total} classes attended
        </span>
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

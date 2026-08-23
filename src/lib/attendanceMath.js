// Pure functions for attendance percentage + "what do I need to do" math.

// How many total lectures/labs a course runs for the semester, based on
// its credit value — this is RUET's fixed formula, used so a student can
// just enter absences without logging every single class.
const SESSIONAL_LOOKUP = { 0.75: 6, 1: 9, 1.5: 12 }

export function computeTotalClasses(courseType, credit) {
  const c = Number(credit) || 0
  if (courseType === 'sessional') {
    if (SESSIONAL_LOOKUP[c] != null) return SESSIONAL_LOOKUP[c]
    return Math.round(c * 8) // reasonable fallback for unusual credit values
  }
  // theory
  return Math.round(c * 13)
}

// Cancelled classes don't count toward the total (neither present nor absent).
export function summarizeRecords(records) {
  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const cancelled = records.filter((r) => r.status === 'cancelled').length
  const total = present + absent
  const percent = total === 0 ? 100 : (present / total) * 100
  return { present, absent, cancelled, total, percent }
}

// Unified summary for a course, whichever tracking mode it uses.
// 'detailed' courses derive numbers from their logged records.
// 'quick' courses derive numbers from credit-based total minus a manual
// absence count the student maintains themselves.
export function summarizeCourse(course, records) {
  if (course.tracking_mode === 'quick') {
    const total = course.total_classes || computeTotalClasses(course.course_type, course.credit)
    const absent = Math.min(course.manual_absences || 0, total)
    const present = total - absent
    const percent = total === 0 ? 100 : (present / total) * 100
    return { present, absent, cancelled: 0, total, percent }
  }
  return summarizeRecords(records)
}

// Returns a human message: how many more classes can be safely skipped,
// or how many in a row must be attended to reach the target %.
export function projection(present, total, targetPercent) {
  const target = targetPercent / 100
  if (total === 0) return { type: 'none', value: 0 }

  const currentPercent = present / total

  if (currentPercent >= target) {
    // Max additional absences while staying at/above target:
    // present / (total + x) >= target  =>  x <= present/target - total
    const maxSkips = Math.floor(present / target - total)
    return { type: 'safe', value: Math.max(0, maxSkips) }
  } else {
    // Classes needed in a row (all present) to reach target:
    // (present + n) / (total + n) >= target
    const numerator = target * total - present
    const denominator = 1 - target
    const n = Math.ceil(numerator / denominator)
    return { type: 'catchup', value: Math.max(0, n) }
  }
}

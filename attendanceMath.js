// Pure functions for attendance percentage + "what do I need to do" math.
// Cancelled classes don't count toward the total (neither present nor absent).

export function summarize(records) {
  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const cancelled = records.filter((r) => r.status === 'cancelled').length
  const total = present + absent
  const percent = total === 0 ? 100 : (present / total) * 100
  return { present, absent, cancelled, total, percent }
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

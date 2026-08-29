// RUET's attendance → marks conversion table (from the course policy).
// Ordered highest to lowest; getBracket finds the first one the percent
// still qualifies for.
export const MARK_BRACKETS = [
  { min: 90, marks: 10 },
  { min: 85, marks: 9 },
  { min: 80, marks: 8 },
  { min: 75, marks: 7 },
  { min: 70, marks: 6 },
  { min: 65, marks: 5 },
  { min: 60, marks: 4 },
  { min: 0, marks: 0 },
]

export function getBracket(percent) {
  return MARK_BRACKETS.find((b) => percent >= b.min) ?? MARK_BRACKETS[MARK_BRACKETS.length - 1]
}

// The best possible final percentage if the student doesn't miss another
// class for the rest of the semester — i.e. total classes (fixed, from
// credit) minus absences-so-far, over that same fixed total. Once a bracket
// falls below this ceiling, it's gone for good; no future attendance can
// bring it back, since the denominator never grows.
export function achievablePercent(totalClasses, absentCount) {
  if (!totalClasses) return 100
  return Math.max(0, ((totalClasses - absentCount) / totalClasses) * 100)
}

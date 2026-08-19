// A semi-circular instrument gauge, styled after a fuel/RPM dial —
// deliberately mechanical since this is built for ME students.
// The needle sweeps 0–100%, with a marked "target" tick and a colored zone
// (danger / warn / safe) based on how far current % is from the target.

export default function AttendanceGauge({ percent, target = 75, size = 160 }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const angle = (clamped / 100) * 180 - 90 // -90deg (0%) to +90deg (100%)
  const targetAngle = (target / 100) * 180 - 90

  const zoneColor =
    clamped >= target ? 'var(--color-safe)' : clamped >= target - 10 ? 'var(--color-warn)' : 'var(--color-danger)'

  const r = size / 2 - 12
  const cx = size / 2
  const cy = size / 2

  // arc path helper
  const polarToCartesian = (angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const start = polarToCartesian(0)
  const end = polarToCartesian(180)
  const arcPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`

  const targetPoint = polarToCartesian((target / 100) * 180)
  const needleEnd = polarToCartesian((clamped / 100) * 180)

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* track */}
        <path d={arcPath} fill="none" stroke="var(--color-surface-2)" strokeWidth="10" strokeLinecap="round" />
        {/* progress arc, colored by zone */}
        <path
          d={arcPath}
          fill="none"
          stroke={zoneColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * (Math.PI * r)} ${Math.PI * r}`}
        />
        {/* target tick */}
        <line
          x1={cx + (r - 12) * Math.cos(((target / 100) * 180 - 180) * (Math.PI / 180))}
          y1={cy + (r - 12) * Math.sin(((target / 100) * 180 - 180) * (Math.PI / 180))}
          x2={cx + (r + 8) * Math.cos(((target / 100) * 180 - 180) * (Math.PI / 180))}
          y2={cy + (r + 8) * Math.sin(((target / 100) * 180 - 180) * (Math.PI / 180))}
          stroke="var(--color-muted)"
          strokeWidth="2"
        />
        {/* needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="var(--color-text)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill="var(--color-text)" />
      </svg>
      <div className="-mt-2 text-center">
        <div className="font-mono text-2xl font-bold" style={{ color: zoneColor }}>
          {clamped.toFixed(1)}%
        </div>
        <div className="text-xs text-muted">target {target}%</div>
      </div>
    </div>
  )
}

interface RouteShortNamePillProps {
  shortName?: string | null
  fallback?: string
  className?: string
}

export function RouteShortNamePill({ shortName, fallback, className }: RouteShortNamePillProps) {
  const candidate = typeof shortName === 'string' ? shortName.trim() : undefined
  const label = candidate && candidate.length > 0 ? candidate : fallback?.trim()

  if (!label) {
    return null
  }

  const classes = [
    'inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-100 shadow-sm shadow-slate-900/40',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classes}>{label}</span>
}

export type { RouteShortNamePillProps }

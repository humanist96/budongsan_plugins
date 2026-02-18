import ProgressBar from '../tutorial/ProgressBar'

interface SeriesCardProps {
  slug: string
  title: string
  order: number
  difficulty: string
  duration: string
  plugins: string[]
  totalSteps: number
  completedSteps: number
  baseUrl: string
}

const DIFFICULTY_COLORS: Record<string, string> = {
  '초급': 'badge--beginner',
  '중급': 'badge--intermediate',
  '중급-고급': 'badge--advanced',
  '중고급': 'badge--advanced',
  '고급': 'badge--expert',
}

function getStatusIcon(completedSteps: number, totalSteps: number) {
  if (totalSteps === 0) return { icon: '\u26AA', label: '미시작' }
  if (completedSteps === 0) return { icon: '\u26AA', label: '미시작' }
  if (completedSteps >= totalSteps) return { icon: '\uD83D\uDFE2', label: '완료' }
  return { icon: '\uD83D\uDD35', label: '진행중' }
}

export default function SeriesCard({
  slug,
  title,
  order,
  difficulty,
  duration,
  plugins,
  totalSteps,
  completedSteps,
  baseUrl,
}: SeriesCardProps) {
  const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
  const status = getStatusIcon(completedSteps, totalSteps)
  const badgeClass = DIFFICULTY_COLORS[difficulty] || 'badge--intermediate'

  return (
    <a href={`${baseUrl}/${slug}`} className="series-card" data-status={status.label}>
      <div className="series-card__header">
        <span className="series-card__order">{order}</span>
        <span className={`series-card__status`} title={status.label}>{status.icon}</span>
      </div>
      <h3 className="series-card__title">{title}</h3>
      <div className="series-card__meta">
        <span className={`badge ${badgeClass}`}>{difficulty}</span>
        {duration && <span className="series-card__duration">{duration}</span>}
      </div>
      {plugins.length > 0 && (
        <div className="series-card__plugins">
          {plugins.slice(0, 3).map((p) => (
            <span key={p} className="series-card__plugin">{p}</span>
          ))}
        </div>
      )}
      <div className="series-card__progress">
        <ProgressBar percent={percent} size="sm" />
      </div>
    </a>
  )
}

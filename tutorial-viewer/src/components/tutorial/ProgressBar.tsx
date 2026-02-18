interface ProgressBarProps {
  percent: number
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export default function ProgressBar({
  percent,
  size = 'md',
  showLabel = true,
}: ProgressBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent))

  return (
    <div className={`progress-bar progress-bar--${size}`}>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${clampedPercent}%` }}
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="progress-bar__label">{clampedPercent}%</span>
      )}
    </div>
  )
}

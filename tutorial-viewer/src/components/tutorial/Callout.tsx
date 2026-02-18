interface CalloutProps {
  type: 'info' | 'warning' | 'danger' | 'tip'
  children: React.ReactNode
}

const CALLOUT_CONFIG = {
  info: { icon: '\u2139\uFE0F', label: '참고', className: 'callout--info' },
  warning: { icon: '\u26A0\uFE0F', label: '주의', className: 'callout--warning' },
  danger: { icon: '\uD83D\uDEA8', label: '경고', className: 'callout--danger' },
  tip: { icon: '\uD83D\uDCA1', label: '팁', className: 'callout--tip' },
} as const

export default function Callout({ type, children }: CalloutProps) {
  const config = CALLOUT_CONFIG[type]

  return (
    <div className={`callout ${config.className}`} role="note">
      <div className="callout__header">
        <span className="callout__icon" aria-hidden="true">{config.icon}</span>
        <span className="callout__label">{config.label}</span>
      </div>
      <div className="callout__content">{children}</div>
    </div>
  )
}

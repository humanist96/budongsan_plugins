interface StepCheckpointProps {
  stepId: string
  stepNumber: number
  isCompleted: boolean
  onToggle: (stepId: string) => void
}

export default function StepCheckpoint({
  stepId,
  stepNumber,
  isCompleted,
  onToggle,
}: StepCheckpointProps) {
  return (
    <div className={`step-checkpoint ${isCompleted ? 'step-checkpoint--done' : ''}`}>
      <label className="step-checkpoint__label">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(stepId)}
          className="step-checkpoint__input"
        />
        <span className="step-checkpoint__box">
          {isCompleted && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="step-checkpoint__text">
          {isCompleted ? `Step ${stepNumber} 완료!` : `이 단계를 완료로 표시하기`}
        </span>
      </label>
    </div>
  )
}

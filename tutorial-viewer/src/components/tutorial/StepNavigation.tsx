import type { StepInfo } from '../../lib/parser'

interface StepNavigationProps {
  steps: StepInfo[]
  currentStepIndex: number
  onNavigate: (index: number) => void
}

export default function StepNavigation({
  steps,
  currentStepIndex,
  onNavigate,
}: StepNavigationProps) {
  const hasPrev = currentStepIndex > 0
  const hasNext = currentStepIndex < steps.length - 1

  return (
    <nav className="step-nav" aria-label="Step 네비게이션">
      <button
        className="step-nav__btn step-nav__btn--prev"
        onClick={() => hasPrev && onNavigate(currentStepIndex - 1)}
        disabled={!hasPrev}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>
          {hasPrev && (
            <>
              <span className="step-nav__label">이전</span>
              <span className="step-nav__title">{steps[currentStepIndex - 1].title}</span>
            </>
          )}
        </span>
      </button>

      <span className="step-nav__indicator">
        {currentStepIndex + 1} / {steps.length}
      </span>

      <button
        className="step-nav__btn step-nav__btn--next"
        onClick={() => hasNext && onNavigate(currentStepIndex + 1)}
        disabled={!hasNext}
      >
        <span>
          {hasNext && (
            <>
              <span className="step-nav__label">다음</span>
              <span className="step-nav__title">{steps[currentStepIndex + 1].title}</span>
            </>
          )}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  )
}

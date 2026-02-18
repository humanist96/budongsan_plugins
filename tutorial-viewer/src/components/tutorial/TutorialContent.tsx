import { useState, useEffect, useCallback, useRef } from 'react'
import TableOfContents from './TableOfContents'
import StepCheckpoint from './StepCheckpoint'
import ProgressBar from './ProgressBar'
import type { TutorialMeta } from '../../lib/parser'
import { getTutorialProgress, toggleStepComplete, saveScrollPosition } from '../../lib/progress'

interface TutorialContentProps {
  tutorial: TutorialMeta
  htmlContent: string
  baseUrl: string
  prevTutorial?: { slug: string; title: string } | null
  nextTutorial?: { slug: string; title: string } | null
}

export default function TutorialContent({
  tutorial,
  htmlContent,
  baseUrl,
  prevTutorial,
  nextTutorial,
}: TutorialContentProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const progress = getTutorialProgress(tutorial.slug)
    setCompletedSteps(progress.completedSteps)

    if (progress.scrollPosition > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, progress.scrollPosition)
      })
    }
  }, [tutorial.slug])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        saveScrollPosition(tutorial.slug, window.scrollY)
      }, 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [tutorial.slug])

  const handleStepToggle = useCallback(
    (stepId: string) => {
      const updated = toggleStepComplete(tutorial.slug, stepId)
      setCompletedSteps(updated.completedSteps)
    },
    [tutorial.slug]
  )

  const percent =
    tutorial.steps.length > 0
      ? Math.round((completedSteps.length / tutorial.steps.length) * 100)
      : 0

  return (
    <div className="tutorial-layout">
      {/* Mobile sidebar toggle */}
      <button
        className="tutorial-layout__sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="목차 열기"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="tutorial-layout__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`tutorial-layout__sidebar ${sidebarOpen ? 'tutorial-layout__sidebar--open' : ''}`}>
        <div className="tutorial-layout__sidebar-header">
          <a href={baseUrl} className="tutorial-layout__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            목록으로
          </a>
          <button
            className="tutorial-layout__sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <TableOfContents
          headings={tutorial.headings}
          completedSteps={completedSteps}
          onStepToggle={handleStepToggle}
        />

        <div className="tutorial-layout__sidebar-progress">
          <span className="tutorial-layout__sidebar-progress-label">진행률</span>
          <ProgressBar percent={percent} />
        </div>
      </aside>

      {/* Main content */}
      <main className="tutorial-layout__main">
        <header className="tutorial-layout__header">
          <div className="tutorial-layout__header-meta">
            <span className={`badge badge--${tutorial.difficulty === '초급' ? 'beginner' : tutorial.difficulty === '중급' ? 'intermediate' : 'advanced'}`}>
              {tutorial.difficulty}
            </span>
            {tutorial.duration && (
              <span className="tutorial-layout__duration">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {tutorial.duration}
              </span>
            )}
            {tutorial.steps.length > 0 && (
              <span className="tutorial-layout__step-count">
                {completedSteps.length}/{tutorial.steps.length} Steps
              </span>
            )}
          </div>
          <h1 className="tutorial-layout__title">{tutorial.title}</h1>
          {tutorial.plugins.length > 0 && (
            <div className="tutorial-layout__plugins">
              {tutorial.plugins.map((p) => (
                <span key={p} className="tutorial-layout__plugin-tag">{p}</span>
              ))}
            </div>
          )}
        </header>

        <div
          ref={contentRef}
          className="tutorial-content prose"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Step checkpoints injected at bottom */}
        {tutorial.steps.length > 0 && (
          <div className="tutorial-layout__checkpoints">
            <h3>진행 체크리스트</h3>
            {tutorial.steps.map((step) => (
              <StepCheckpoint
                key={step.id}
                stepId={step.id}
                stepNumber={step.number}
                isCompleted={completedSteps.includes(step.id)}
                onToggle={handleStepToggle}
              />
            ))}
          </div>
        )}

        {/* Tutorial navigation */}
        <nav className="tutorial-nav">
          {prevTutorial ? (
            <a href={`${baseUrl}/${prevTutorial.slug}`} className="tutorial-nav__link tutorial-nav__link--prev">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>
                <span className="tutorial-nav__label">이전 튜터리얼</span>
                <span className="tutorial-nav__title">{prevTutorial.title}</span>
              </span>
            </a>
          ) : (
            <div />
          )}
          {nextTutorial ? (
            <a href={`${baseUrl}/${nextTutorial.slug}`} className="tutorial-nav__link tutorial-nav__link--next">
              <span>
                <span className="tutorial-nav__label">다음 튜터리얼</span>
                <span className="tutorial-nav__title">{nextTutorial.title}</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          ) : (
            <div />
          )}
        </nav>
      </main>
    </div>
  )
}

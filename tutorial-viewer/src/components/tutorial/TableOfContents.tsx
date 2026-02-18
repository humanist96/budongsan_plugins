import { useState, useEffect, useCallback } from 'react'
import type { HeadingInfo } from '../../lib/parser'

interface TableOfContentsProps {
  headings: HeadingInfo[]
  completedSteps: string[]
  onStepToggle: (stepId: string) => void
}

export default function TableOfContents({
  headings,
  completedSteps,
  onStepToggle,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState('')

  const handleScroll = useCallback(() => {
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    let current = ''
    for (const el of headingElements) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= 120) {
        current = el.id
      }
    }
    setActiveId(current)
  }, [headings])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const isStepHeading = (text: string) => /^Step\s+\d+/i.test(text)
  const getStepId = (text: string) => {
    const match = text.match(/Step\s+(\d+)/i)
    return match ? `step-${match[1]}` : null
  }

  return (
    <nav className="toc" aria-label="목차">
      <h3 className="toc__title">목차</h3>
      <ul className="toc__list">
        {headings
          .filter((h) => h.depth >= 2 && h.depth <= 3)
          .map((heading) => {
            const stepId = getStepId(heading.text)
            const isCompleted = stepId ? completedSteps.includes(stepId) : false
            const isStep = isStepHeading(heading.text)
            const isActive = heading.id === activeId

            return (
              <li
                key={heading.id}
                className={`toc__item toc__item--depth-${heading.depth} ${isActive ? 'toc__item--active' : ''}`}
              >
                <div className="toc__item-row">
                  {isStep && (
                    <button
                      className={`toc__check ${isCompleted ? 'toc__check--done' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (stepId) onStepToggle(stepId)
                      }}
                      aria-label={isCompleted ? '완료 취소' : '완료 표시'}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </button>
                  )}
                  {!isStep && <span className="toc__bullet" />}
                  <button
                    className="toc__link"
                    onClick={() => scrollToHeading(heading.id)}
                  >
                    {heading.text}
                  </button>
                </div>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}

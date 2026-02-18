import { useState, useEffect } from 'react'
import SeriesCard from './SeriesCard'
import type { TutorialMeta } from '../../lib/parser'
import { loadProgress } from '../../lib/progress'

interface SeriesGridProps {
  tutorials: TutorialMeta[]
  baseUrl: string
}

type FilterDifficulty = '전체' | '초급' | '중급' | '중급-고급' | '고급'
type FilterStatus = '전체' | '미시작' | '진행중' | '완료'

export default function SeriesGrid({ tutorials, baseUrl }: SeriesGridProps) {
  const [difficulty, setDifficulty] = useState<FilterDifficulty>('전체')
  const [status, setStatus] = useState<FilterStatus>('전체')
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})

  useEffect(() => {
    const progress = loadProgress()
    const map: Record<string, number> = {}
    for (const t of tutorials) {
      const tp = progress.tutorials[t.slug]
      map[t.slug] = tp ? tp.completedSteps.length : 0
    }
    setProgressMap(map)
  }, [tutorials])

  const filtered = tutorials.filter((t) => {
    if (difficulty !== '전체' && t.difficulty !== difficulty) return false
    if (status !== '전체') {
      const completed = progressMap[t.slug] || 0
      const total = t.steps.length
      if (status === '미시작' && completed > 0) return false
      if (status === '진행중' && (completed === 0 || completed >= total)) return false
      if (status === '완료' && (total === 0 || completed < total)) return false
    }
    return true
  })

  const difficultyOptions: FilterDifficulty[] = ['전체', '초급', '중급', '중급-고급', '고급']
  const statusOptions: FilterStatus[] = ['전체', '미시작', '진행중', '완료']

  return (
    <div className="series-grid-container">
      <div className="series-grid__filters">
        <div className="filter-group">
          <label className="filter-group__label">난이도</label>
          <div className="filter-group__options">
            {difficultyOptions.map((opt) => (
              <button
                key={opt}
                className={`filter-chip ${difficulty === opt ? 'filter-chip--active' : ''}`}
                onClick={() => setDifficulty(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-group__label">상태</label>
          <div className="filter-group__options">
            {statusOptions.map((opt) => (
              <button
                key={opt}
                className={`filter-chip ${status === opt ? 'filter-chip--active' : ''}`}
                onClick={() => setStatus(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="series-grid">
        {filtered.map((t) => (
          <SeriesCard
            key={t.slug}
            slug={t.slug}
            title={t.title}
            order={t.order}
            difficulty={t.difficulty}
            duration={t.duration}
            plugins={t.plugins}
            totalSteps={t.steps.length}
            completedSteps={progressMap[t.slug] || 0}
            baseUrl={baseUrl}
          />
        ))}
        {filtered.length === 0 && (
          <div className="series-grid__empty">
            <p>조건에 맞는 튜터리얼이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

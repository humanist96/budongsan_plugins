const STORAGE_KEY = 'tutorial-viewer-progress'
const SCHEMA_VERSION = 1

export interface UserProgress {
  version: number
  tutorials: Record<string, TutorialProgress>
  lastVisited: string
  lastUpdated: string
}

export interface TutorialProgress {
  completedSteps: string[]
  scrollPosition: number
  lastVisited: string
}

function getDefaultProgress(): UserProgress {
  return {
    version: SCHEMA_VERSION,
    tutorials: {},
    lastVisited: '',
    lastUpdated: new Date().toISOString(),
  }
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultProgress()
    const data = JSON.parse(raw) as UserProgress
    if (data.version !== SCHEMA_VERSION) return getDefaultProgress()
    return data
  } catch {
    return getDefaultProgress()
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  try {
    const updated = { ...progress, lastUpdated: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // storage full or unavailable
  }
}

export function getTutorialProgress(slug: string): TutorialProgress {
  const progress = loadProgress()
  return (
    progress.tutorials[slug] || {
      completedSteps: [],
      scrollPosition: 0,
      lastVisited: '',
    }
  )
}

export function toggleStepComplete(slug: string, stepId: string): TutorialProgress {
  const progress = loadProgress()
  const tutorial = progress.tutorials[slug] || {
    completedSteps: [],
    scrollPosition: 0,
    lastVisited: new Date().toISOString(),
  }

  const idx = tutorial.completedSteps.indexOf(stepId)
  const completedSteps =
    idx >= 0
      ? tutorial.completedSteps.filter((s) => s !== stepId)
      : [...tutorial.completedSteps, stepId]

  const updatedTutorial = {
    ...tutorial,
    completedSteps,
    lastVisited: new Date().toISOString(),
  }

  const updatedProgress = {
    ...progress,
    tutorials: { ...progress.tutorials, [slug]: updatedTutorial },
    lastVisited: slug,
  }

  saveProgress(updatedProgress)
  return updatedTutorial
}

export function saveScrollPosition(slug: string, position: number): void {
  const progress = loadProgress()
  const tutorial = progress.tutorials[slug] || {
    completedSteps: [],
    scrollPosition: 0,
    lastVisited: new Date().toISOString(),
  }

  const updatedProgress = {
    ...progress,
    tutorials: {
      ...progress.tutorials,
      [slug]: { ...tutorial, scrollPosition: position },
    },
    lastVisited: slug,
  }
  saveProgress(updatedProgress)
}

export function getCompletionPercent(slug: string, totalSteps: number): number {
  if (totalSteps === 0) return 0
  const tutorial = getTutorialProgress(slug)
  return Math.round((tutorial.completedSteps.length / totalSteps) * 100)
}

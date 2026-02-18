import type { TutorialMeta } from './parser'

export interface SeriesInfo {
  name: string
  tutorials: TutorialMeta[]
}

export function groupBySeries(tutorials: TutorialMeta[]): SeriesInfo[] {
  const groups = new Map<string, TutorialMeta[]>()

  for (const t of tutorials) {
    const name = t.seriesName
    const existing = groups.get(name) || []
    groups.set(name, [...existing, t])
  }

  return Array.from(groups.entries()).map(([name, tuts]) => ({
    name,
    tutorials: [...tuts].sort((a, b) => a.order - b.order),
  }))
}

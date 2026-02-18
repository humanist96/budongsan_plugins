import matter from 'gray-matter'

export interface TutorialMeta {
  slug: string
  title: string
  seriesName: string
  order: number
  difficulty: string
  duration: string
  plugins: string[]
  description: string
  steps: StepInfo[]
  prerequisites: string[]
  nextTutorials: string[]
  headings: HeadingInfo[]
}

export interface StepInfo {
  id: string
  number: number
  title: string
  headingId: string
}

export interface HeadingInfo {
  depth: number
  text: string
  id: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractFromFilename(filename: string): { order: number; slug: string } {
  const match = filename.match(/튜터리얼(\d+)_(.+)\.md$/)
  if (match) {
    return { order: parseInt(match[1], 10), slug: `tutorial-${match[1]}` }
  }
  const engMatch = filename.match(/[Tt]utorial[_-]?(\d+)[_-](.+)\.md$/)
  if (engMatch) {
    return { order: parseInt(engMatch[1], 10), slug: `tutorial-${engMatch[1]}` }
  }
  return { order: 0, slug: slugify(filename.replace(/\.md$/, '')) }
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : '제목 없음'
}

function extractMetaField(content: string, pattern: RegExp): string {
  const match = content.match(pattern)
  return match ? match[1].trim() : ''
}

function extractPlugins(content: string): string[] {
  const sectionMatch = content.match(/\*\*사용 플러그인:\*\*(.+?)(?=\n\n|\n###|\n##|\n---)/s)
  if (!sectionMatch) return []
  const text = sectionMatch[1]
  const plugins: string[] = []
  const linkMatches = text.matchAll(/\[([^\]]+)\]/g)
  for (const m of linkMatches) {
    plugins.push(m[1])
  }
  if (plugins.length === 0) {
    const inlineMatches = text.matchAll(/`([^`]+)`/g)
    for (const m of inlineMatches) {
      plugins.push(m[1])
    }
  }
  if (plugins.length === 0) {
    const lines = text.split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('*'))
    for (const line of lines) {
      const cleaned = line.replace(/^[\s*-]+/, '').trim()
      if (cleaned) plugins.push(cleaned)
    }
  }
  return plugins
}

function extractSteps(content: string): StepInfo[] {
  const steps: StepInfo[] = []
  const stepPattern = /^##\s+Step\s+(\d+)\s*[:：]?\s*(.+)$/gm
  let match
  while ((match = stepPattern.exec(content)) !== null) {
    const number = parseInt(match[1], 10)
    const title = match[2].trim()
    steps.push({
      id: `step-${number}`,
      number,
      title,
      headingId: slugify(`step-${number}-${title}`),
    })
  }
  return steps
}

function extractHeadings(content: string): HeadingInfo[] {
  const headings: HeadingInfo[] = []
  const headingPattern = /^(#{1,6})\s+(.+)$/gm
  let match
  while ((match = headingPattern.exec(content)) !== null) {
    const depth = match[1].length
    const text = match[2].trim()
    headings.push({
      depth,
      text,
      id: slugify(text),
    })
  }
  return headings
}

function extractNextTutorials(content: string): string[] {
  const nextSection = content.match(/##\s*다음\s*단계([\s\S]*?)(?=\n##[^#]|\n---|\Z)/m)
  if (!nextSection) return []
  const links: string[] = []
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
  let match
  while ((match = linkPattern.exec(nextSection[1])) !== null) {
    const href = match[2]
    const fileMatch = href.match(/튜터리얼(\d+)/)
    if (fileMatch) {
      links.push(`tutorial-${fileMatch[1]}`)
    }
  }
  return links
}

function extractDescription(content: string): string {
  const overviewMatch = content.match(/##\s*개요\s*\n([\s\S]*?)(?=\n##[^#]|\n---)/m)
  if (!overviewMatch) return ''
  const purposeMatch = overviewMatch[1].match(/\*\*목적:\*\*\s*(.+)/)
  if (purposeMatch) return purposeMatch[1].trim()
  const firstSentence = overviewMatch[1].match(/^[^*#\n-].+/m)
  return firstSentence ? firstSentence[0].trim() : ''
}

export function parseTutorial(filename: string, rawContent: string): TutorialMeta {
  const { data: frontmatter, content } = matter(rawContent)
  const { order: fileOrder, slug: fileSlug } = extractFromFilename(filename)

  const title = frontmatter.title || extractTitle(content)
  const slug = fileSlug
  const order = frontmatter.order || fileOrder
  const difficulty = frontmatter.difficulty || extractMetaField(content, /\*\*난이도:\*\*\s*(.+)/)
  const duration = frontmatter.duration || extractMetaField(content, /\*\*소요\s*시간:\*\*\s*(.+)/)
  const plugins = frontmatter.plugins || extractPlugins(content)
  const seriesName = frontmatter.series || '부동산 투자 플러그인'

  return {
    slug,
    title,
    seriesName,
    order,
    difficulty: difficulty || '중급',
    duration: duration || '',
    plugins,
    description: extractDescription(content),
    steps: extractSteps(content),
    prerequisites: [],
    nextTutorials: extractNextTutorials(content),
    headings: extractHeadings(content),
  }
}

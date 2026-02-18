/**
 * Custom markdown-to-HTML renderer that transforms tutorial content
 * into enriched HTML with special block types.
 */

export interface ParsedBlock {
  type: 'prompt' | 'expected-output' | 'terminal' | 'config' | 'code' | 'callout' | 'html'
  content: string
  language?: string
  calloutType?: 'info' | 'warning' | 'danger' | 'tip'
  filePath?: string
}

const CALLOUT_PATTERNS: Record<string, 'info' | 'warning' | 'danger' | 'tip'> = {
  '참고': 'info',
  '주의': 'warning',
  '위험': 'danger',
  '경고': 'danger',
  '팁': 'tip',
  '💡': 'tip',
  'Note': 'info',
  'Warning': 'warning',
  'Danger': 'danger',
  'Tip': 'tip',
}

export function detectCalloutType(text: string): 'info' | 'warning' | 'danger' | 'tip' | null {
  for (const [pattern, type] of Object.entries(CALLOUT_PATTERNS)) {
    if (text.includes(`**${pattern}:**`) || text.includes(`**${pattern}**:`)) {
      return type
    }
  }
  return null
}

export function isPromptContext(precedingHtml: string): boolean {
  const lower = precedingHtml.toLowerCase()
  const lastHeadingMatch = precedingHtml.match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>\s*$/i)
  if (lastHeadingMatch) {
    const heading = lastHeadingMatch[1]
    if (/프롬프트|prompt/i.test(heading)) return true
  }
  const lastParagraph = precedingHtml.match(/<p[^>]*>([^<]*)<\/p>\s*$/i)
  if (lastParagraph) {
    const text = lastParagraph[1]
    if (/프롬프트|prompt|claude.*입력|입력.*claude/i.test(text)) return true
  }
  if (/\*\*프롬프트:?\*\*/.test(lower)) return true
  return false
}

export function isExpectedOutputContext(precedingHtml: string): boolean {
  return /예상\s*(응답|결과)|expected\s*(response|output)/i.test(precedingHtml)
}

export function isTerminalLanguage(lang: string): boolean {
  return ['bash', 'shell', 'sh', 'zsh', 'console', 'terminal'].includes(lang.toLowerCase())
}

export function isConfigLanguage(lang: string, content: string): boolean {
  if (!['json', 'yaml', 'yml', 'toml', 'ini', 'env'].includes(lang.toLowerCase())) return false
  return /settings|config|env|\.json|\.yaml|\.yml|\.toml/.test(content.slice(0, 200).toLowerCase())
}

export function extractFilePath(content: string): string | null {
  const commentMatch = content.match(/^(?:\/\/|#)\s*(.+\.\w+)\s*$/m)
  if (commentMatch) return commentMatch[1].trim()
  const pathMatch = content.match(/["']([./~][\w/.@-]+\.\w+)["']/)
  if (pathMatch) return pathMatch[1]
  return null
}

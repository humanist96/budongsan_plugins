import { Marked } from 'marked'
import matter from 'gray-matter'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildCopyButton(): string {
  return [
    '<button class="copy-btn copy-btn--icon" onclick="',
    "var c=this.closest('[data-copyable]');",
    "if(c){navigator.clipboard.writeText(c.querySelector('code').textContent)}",
    '" title="\uBCF5\uC0AC">',
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>',
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    '</svg></button>',
  ].join('')
}

function buildTerminalBlock(escaped: string): string {
  const parts = [
    '<div class="terminal-block-static" data-copyable>',
    '<div class="terminal-block__header">',
    '<div class="terminal-block__dots">',
    '<span class="terminal-block__dot terminal-block__dot--red"></span>',
    '<span class="terminal-block__dot terminal-block__dot--yellow"></span>',
    '<span class="terminal-block__dot terminal-block__dot--green"></span>',
    '</div>',
    '<span class="terminal-block__title">Terminal</span>',
    buildCopyButton(),
    '</div>',
    '<pre class="terminal-block__pre"><code>',
    escaped,
    '</code></pre>',
    '</div>',
  ]
  return parts.join('')
}

function buildCodeBlock(escaped: string, language: string): string {
  const langLabel = language
    ? '<span class="code-block__lang">' + language + '</span>'
    : ''
  const parts = [
    '<div class="code-block-static" data-copyable>',
    '<div class="code-block__header">',
    langLabel,
    buildCopyButton(),
    '</div>',
    '<pre class="code-block__pre"><code class="language-' + language + '">',
    escaped,
    '</code></pre>',
    '</div>',
  ]
  return parts.join('')
}

function buildCallout(type: string, icon: string, label: string, content: string): string {
  return [
    '<div class="callout callout--' + type + '" role="note">',
    '<div class="callout__header">',
    '<span class="callout__icon">' + icon + '</span>',
    '<span class="callout__label">' + label + '</span>',
    '</div>',
    '<div class="callout__content"><p>' + content + '</p></div>',
    '</div>',
  ].join('')
}

function buildPromptCard(content: string): string {
  const encodedContent = encodeURIComponent(content)
  return [
    '<div class="prompt-card">',
    '<div class="prompt-card__header">',
    '<div class="prompt-card__label">',
    '<span class="prompt-card__icon">\uD83D\uDCAC</span>',
    '<span>Claude \uD504\uB86C\uD504\uD2B8</span>',
    '</div>',
    '<button class="copy-btn copy-btn--text" onclick="',
    "navigator.clipboard.writeText(decodeURIComponent('" + encodedContent + "'));",
    "var s=this.querySelector('span');s.textContent='\uBCF5\uC0AC\uB428!';",
    "setTimeout(function(){s.textContent='\uBCF5\uC0AC'},2000)",
    '">',
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>',
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    '</svg>',
    '<span>\uBCF5\uC0AC</span>',
    '</button>',
    '</div>',
    '<div class="prompt-card__body"><p>' + content + '</p></div>',
    '</div>',
  ].join('')
}

function buildCollapsibleOutput(codeBlock: string): string {
  return [
    '<details class="collapsible-output">',
    '<summary class="collapsible-output__trigger">',
    '<svg class="collapsible-output__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<polyline points="9 18 15 12 9 6"/>',
    '</svg>',
    '<span>\uC608\uC0C1 \uACB0\uACFC \uBCF4\uAE30</span>',
    '<span class="collapsible-output__hint">\uC9C1\uC811 \uD574\uBCF4\uC138\uC694!</span>',
    '</summary>',
    '<div class="collapsible-output__content">',
    codeBlock,
    '</div>',
    '</details>',
  ].join('')
}

export async function renderTutorialMarkdown(rawContent: string): Promise<string> {
  const { content: markdownContent } = matter(rawContent)
  const marked = new Marked()

  const TERMINAL_LANGS = ['bash', 'shell', 'sh', 'zsh']

  const renderer = {
    heading({ tokens, depth }: { tokens: any[]; depth: number }) {
      const text = tokens.map((t: any) => t.raw || t.text || '').join('')
      const cleanText = text.replace(/<[^>]+>/g, '')
      const id = cleanText
        .toLowerCase()
        .replace(/[^\w\s가-힣-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      return '<h' + depth + ' id="' + id + '">' + text + '</h' + depth + '>'
    },

    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang || ''
      const escaped = escapeHtml(text)
      const isTerminal = TERMINAL_LANGS.includes(language.toLowerCase())

      if (isTerminal) {
        return buildTerminalBlock(escaped)
      }
      return buildCodeBlock(escaped, language)
    },

    blockquote({ tokens }: { tokens: any[] }) {
      const inner = tokens
        .map((t: any) => {
          if (t.type === 'paragraph') {
            return t.raw || t.text || ''
          }
          return t.raw || ''
        })
        .join('')

      const calloutMap: Array<{ pattern: string; type: string; icon: string; label: string }> = [
        { pattern: '**\uCC38\uACE0:**', type: 'info', icon: '\u2139\uFE0F', label: '\uCC38\uACE0' },
        { pattern: '**\uC8FC\uC758:**', type: 'warning', icon: '\u26A0\uFE0F', label: '\uC8FC\uC758' },
        { pattern: '**\uC704\uD5D8:**', type: 'danger', icon: '\uD83D\uDEA8', label: '\uC704\uD5D8' },
        { pattern: '**\uACBD\uACE0:**', type: 'danger', icon: '\uD83D\uDEA8', label: '\uACBD\uACE0' },
        { pattern: '**\uD301:**', type: 'tip', icon: '\uD83D\uDCA1', label: '\uD301' },
      ]

      for (const c of calloutMap) {
        if (inner.includes(c.pattern)) {
          const cleanContent = inner.replace(c.pattern, '').trim()
          return buildCallout(c.type, c.icon, c.label, cleanContent)
        }
      }

      return '<blockquote>' + inner + '</blockquote>'
    },

    table({ header, rows }: { header: any[]; rows: any[][] }) {
      const headerHtml = header
        .map((cell: any) => {
          const text = cell.tokens
            ? cell.tokens.map((t: any) => t.raw || t.text || '').join('')
            : cell.text || ''
          return '<th>' + text + '</th>'
        })
        .join('')

      const rowsHtml = rows
        .map((row: any[]) => {
          const cells = row
            .map((cell: any) => {
              const text = cell.tokens
                ? cell.tokens.map((t: any) => t.raw || t.text || '').join('')
                : cell.text || ''
              return '<td>' + text + '</td>'
            })
            .join('')
          return '<tr>' + cells + '</tr>'
        })
        .join('')

      return (
        '<div class="table-wrapper"><table><thead><tr>' +
        headerHtml +
        '</tr></thead><tbody>' +
        rowsHtml +
        '</tbody></table></div>'
      )
    },
  }

  marked.use({ renderer })
  let html = await marked.parse(markdownContent)

  // Post-process: detect prompt blocks
  html = html.replace(
    /(<(?:p|h[1-6])[^>]*>[^<]*(?:프롬프트|Claude[^<]*입력|입력[^<]*Claude)[^<]*<\/(?:p|h[1-6])>\s*)<div class="code-block-static"[^>]*>\s*<div class="code-block__header">[\s\S]*?<\/div>\s*<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>\s*<\/div>/gi,
    (_match, prefix, codeContent) => {
      const decoded = codeContent
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
      return prefix + buildPromptCard(decoded)
    }
  )

  // Post-process: expected output blocks
  html = html.replace(
    /(<(?:p|h[1-6])[^>]*>[^<]*(?:예상\s*(?:응답|결과))[^<]*<\/(?:p|h[1-6])>\s*)(<div class="(?:code-block-static|terminal-block-static)"[\s\S]*?<\/div>)/gi,
    (_match, prefix, codeBlock) => {
      return prefix + buildCollapsibleOutput(codeBlock)
    }
  )

  return html
}

import CopyButton from '../common/CopyButton'

interface TerminalBlockProps {
  code: string
}

export default function TerminalBlock({ code }: TerminalBlockProps) {
  const commands = code
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => l.replace(/^\$\s*/, ''))
    .join('\n')

  return (
    <div className="terminal-block">
      <div className="terminal-block__header">
        <div className="terminal-block__dots">
          <span className="terminal-block__dot terminal-block__dot--red" />
          <span className="terminal-block__dot terminal-block__dot--yellow" />
          <span className="terminal-block__dot terminal-block__dot--green" />
        </div>
        <span className="terminal-block__title">Terminal</span>
        <CopyButton text={commands} />
      </div>
      <pre className="terminal-block__pre">
        <code>
          {code.split('\n').map((line, i) => {
            const trimmed = line.trim()
            if (!trimmed) return <br key={i} />
            const isComment = trimmed.startsWith('#')
            return (
              <span key={i} className={`terminal-block__line ${isComment ? 'terminal-block__line--comment' : ''}`}>
                {!isComment && !trimmed.startsWith('$') && <span className="terminal-block__prompt">$ </span>}
                {trimmed.startsWith('$') && (
                  <>
                    <span className="terminal-block__prompt">$ </span>
                    {trimmed.slice(1).trimStart()}
                  </>
                )}
                {isComment && trimmed}
                {!isComment && !trimmed.startsWith('$') && trimmed}
                {'\n'}
              </span>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

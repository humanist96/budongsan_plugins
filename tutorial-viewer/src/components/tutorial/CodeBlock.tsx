import CopyButton from '../common/CopyButton'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  filePath?: string
}

export default function CodeBlock({
  code,
  language = '',
  showLineNumbers = false,
  filePath,
}: CodeBlockProps) {
  const lines = code.split('\n')

  return (
    <div className="code-block">
      {(filePath || language) && (
        <div className="code-block__header">
          {filePath && <span className="code-block__filepath">{filePath}</span>}
          {!filePath && language && <span className="code-block__lang">{language}</span>}
          <CopyButton text={code} />
        </div>
      )}
      {!filePath && !language && (
        <div className="code-block__copy-only">
          <CopyButton text={code} />
        </div>
      )}
      <pre className={`code-block__pre ${showLineNumbers ? 'code-block__pre--numbered' : ''}`}>
        <code className={language ? `language-${language}` : ''}>
          {showLineNumbers
            ? lines.map((line, i) => (
                <span key={i} className="code-block__line">
                  <span className="code-block__line-number">{i + 1}</span>
                  <span className="code-block__line-content">{line}</span>
                  {'\n'}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  )
}

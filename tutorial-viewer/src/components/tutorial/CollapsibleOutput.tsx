import { useState } from 'react'

interface CollapsibleOutputProps {
  content: string
  label?: string
}

export default function CollapsibleOutput({
  content,
  label = '예상 결과 보기',
}: CollapsibleOutputProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`collapsible-output ${isOpen ? 'collapsible-output--open' : ''}`}>
      <button
        className="collapsible-output__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <svg
          className="collapsible-output__chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>{label}</span>
        {!isOpen && <span className="collapsible-output__hint">직접 해보세요!</span>}
      </button>
      <div className="collapsible-output__content">
        <pre><code>{content}</code></pre>
      </div>
    </div>
  )
}

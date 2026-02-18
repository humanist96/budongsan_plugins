import CopyButton from '../common/CopyButton'

interface PromptCardProps {
  content: string
}

export default function PromptCard({ content }: PromptCardProps) {
  return (
    <div className="prompt-card">
      <div className="prompt-card__header">
        <div className="prompt-card__label">
          <span className="prompt-card__icon" aria-hidden="true">&#x1F4AC;</span>
          <span>Claude 프롬프트</span>
        </div>
        <CopyButton
          text={content}
          label="복사"
          successMessage="프롬프트가 복사되었습니다!"
          variant="text"
        />
      </div>
      <div className="prompt-card__body">
        <p>{content}</p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TarotSpreadType } from '../lib/api'

interface TarotFormProps {
  loading: boolean
  onSubmit: (params: { question: string; spreadType: TarotSpreadType }) => void
}

const SPREAD_OPTIONS: { value: TarotSpreadType; label: string; description: string }[] = [
  {
    value: 'ONE_CARD',
    label: '원 카드',
    description: '지금 이 순간의 핵심 메시지 한 가지에 집중해요.',
  },
  {
    value: 'THREE_CARD',
    label: '쓰리 카드',
    description: '과거 · 현재 · 미래의 흐름을 함께 바라봐요.',
  },
]

export function TarotForm({ loading, onSubmit }: TarotFormProps) {
  const [question, setQuestion] = useState('')
  const [spreadType, setSpreadType] = useState<TarotSpreadType>('ONE_CARD')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || loading) return

    onSubmit({ question: trimmed, spreadType })
  }

  return (
    <section className="mb-8 rounded-3xl border border-purple-500/30 bg-black/40 p-5 shadow-[0_0_40px_rgba(120,40,200,0.35)] backdrop-blur-sm md:p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="question"
            className="flex items-center justify-between text-xs font-medium text-purple-100/90"
          >
            <span>지금 가장 마음에 걸리는 고민을 적어주세요.</span>
            <span className="text-[10px] text-purple-300/70">최대 300자</span>
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예) 요즘 일이 힘든데, 내가 가고 있는 방향이 맞는 걸까요?"
            rows={4}
            maxLength={300}
            className="w-full rounded-2xl border border-purple-500/40 bg-black/40 px-3.5 py-3 text-sm text-purple-50 outline-none ring-1 ring-transparent transition focus:border-amber-300/70 focus:ring-amber-300/40 placeholder:text-purple-300/50"
          />
          <p className="text-[11px] text-purple-200/70">
            질문은 구체적일수록 좋아요. &quot;내가 진짜 알고 싶은 한 가지&quot;에 집중해 보세요.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-purple-100/90">카드 전개 방식을 선택해 주세요.</p>
          <div className="grid gap-2.5 md:grid-cols-2">
            {SPREAD_OPTIONS.map((option) => {
              const selected = spreadType === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSpreadType(option.value)}
                  className={[
                    'flex flex-col rounded-2xl border px-3.5 py-2.5 text-left transition',
                    'bg-gradient-to-br from-purple-900/40 to-black/60 hover:from-purple-800/60 hover:to-black',
                    selected
                      ? 'border-amber-300/80 shadow-[0_0_25px_rgba(245,200,120,0.45)]'
                      : 'border-purple-600/40 shadow-[0_0_15px_rgba(120,60,200,0.4)]',
                  ].join(' ')}
                >
                  <span className="text-xs font-semibold text-amber-100">{option.label}</span>
                  <span className="mt-1.5 text-[11px] text-purple-100/80">{option.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-purple-200/70">
            카드를 누르기 전, 마음속으로 한 번 더 질문을 또렷하게 떠올려 보세요.
          </p>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase',
              'bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 text-black shadow-[0_0_25px_rgba(245,200,120,0.6)]',
              'transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
            ].join(' ')}
          >
            {loading ? '카드를 읽는 중…' : '카드 펼치기'}
          </button>
        </div>
      </form>
    </section>
  )
}


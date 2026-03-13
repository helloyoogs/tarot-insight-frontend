import type { TarotReadingResponse } from '../lib/api'

interface TarotResultProps {
  result?: TarotReadingResponse
  loading: boolean
  error?: string
}

export function TarotResult({ result, loading, error }: TarotResultProps) {
  const hasResult = !!result && !error

  return (
    <section className="mt-2 flex-1 rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-950/60 via-black/70 to-slate-950/80 p-5 shadow-[0_0_45px_rgba(80,30,160,0.7)] backdrop-blur-sm md:p-6">
      {loading && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-300/80 border-t-transparent" />
          <p className="text-sm text-purple-100/90">
            카드를 하나씩 살펴보며 의미를 정리하고 있어요…
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-5 text-center">
          <p className="text-sm font-medium text-red-100">결과를 불러오는 중 문제가 발생했어요.</p>
          <p className="text-xs text-red-100/80">{error}</p>
          <p className="mt-2 text-[11px] text-red-100/70">
            잠시 후 다시 시도해 보시고, 계속 문제가 반복된다면 새로고침 후 다시 질문해 주세요.
          </p>
        </div>
      )}

      {!loading && !error && hasResult && (
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-purple-500/30 pb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-purple-300/80">Drawn Card</p>
              <p className="mt-1 text-xl font-semibold text-amber-100">{result!.cardName}</p>
            </div>
            <p className="text-[11px] text-purple-200/80">
              {new Date(result!.createdAt).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-purple-500/25 bg-black/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-300/90">
              Your Question
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-purple-50/95">
              {result!.question}
            </p>
          </div>

          <div className="mt-1 flex-1 space-y-2 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-purple-900/60 via-black/70 to-amber-950/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/95">
              Tarot Insight
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-50/95">
              {result!.resultText}
            </p>
          </div>

          <p className="mt-1 text-[11px] text-purple-200/80">
            이 카드는 &quot;정답&quot;이 아니라, 지금의 당신이 더 편안한 선택을 할 수 있도록 도와주는
            하나의 시선일 뿐이에요. 마음에 남는 문장 한 줄만 가볍게 가져가 보세요.
          </p>
        </div>
      )}

      {!loading && !error && !hasResult && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium text-purple-100/90">
            아직 카드를 펼치지 않았어요.
          </p>
          <p className="max-w-xs text-[11px] text-purple-200/80">
            위에 오늘 가장 마음에 걸리는 고민을 적고, 카드 전개 방식을 선택한 뒤
            <span className="mx-1 font-semibold text-amber-200">카드 펼치기</span>
            를 눌러 주세요.
          </p>
        </div>
      )}
    </section>
  )
}


import type { ThemeTarotResponse } from '../lib/api'

type ThemeStyle = {
  border: string
  gradient: string
  shadow: string
  title: string
  cardBorder: string
  textMeta: string
  textDesc: string
  textBody: string
  textMuted: string
}

const STYLES: ThemeStyle[] = [
  { border: 'border-amber-400/40', gradient: 'from-amber-900/60 via-black/70 to-purple-950/70', shadow: '0 0 35px rgba(245,200,120,0.5)', title: 'text-amber-100', cardBorder: 'border-amber-300/40', textMeta: 'text-amber-200/90', textDesc: 'text-amber-100/90', textBody: 'text-amber-50/95', textMuted: 'text-amber-100/80' },
  { border: 'border-emerald-400/40', gradient: 'from-emerald-900/60 via-black/70 to-purple-950/70', shadow: '0 0 35px rgba(52,211,153,0.5)', title: 'text-emerald-100', cardBorder: 'border-emerald-300/40', textMeta: 'text-emerald-200/90', textDesc: 'text-emerald-100/90', textBody: 'text-emerald-50/95', textMuted: 'text-emerald-100/80' },
  { border: 'border-sky-400/40', gradient: 'from-sky-900/60 via-black/70 to-purple-950/70', shadow: '0 0 35px rgba(56,189,248,0.5)', title: 'text-sky-100', cardBorder: 'border-sky-300/40', textMeta: 'text-sky-200/90', textDesc: 'text-sky-100/90', textBody: 'text-sky-50/95', textMuted: 'text-sky-100/80' },
  { border: 'border-yellow-400/40', gradient: 'from-yellow-900/60 via-black/70 to-amber-950/70', shadow: '0 0 35px rgba(250,204,21,0.5)', title: 'text-yellow-100', cardBorder: 'border-yellow-300/40', textMeta: 'text-yellow-200/90', textDesc: 'text-yellow-100/90', textBody: 'text-yellow-50/95', textMuted: 'text-yellow-100/80' },
  { border: 'border-rose-400/40', gradient: 'from-rose-900/60 via-black/70 to-purple-950/70', shadow: '0 0 35px rgba(251,113,133,0.5)', title: 'text-rose-100', cardBorder: 'border-rose-300/40', textMeta: 'text-rose-200/90', textDesc: 'text-rose-100/90', textBody: 'text-rose-50/95', textMuted: 'text-rose-100/80' },
  { border: 'border-teal-400/40', gradient: 'from-teal-900/60 via-black/70 to-cyan-950/70', shadow: '0 0 35px rgba(45,212,191,0.5)', title: 'text-teal-100', cardBorder: 'border-teal-300/40', textMeta: 'text-teal-200/90', textDesc: 'text-teal-100/90', textBody: 'text-teal-50/95', textMuted: 'text-teal-100/80' },
]

interface ThemeTarotCardProps {
  themeName: string
  themeDescription: string
  result: ThemeTarotResponse | undefined
  loading: boolean
  error: string | undefined
  disabled: boolean
  onDraw: () => void
  styleIndex: number
}

export function ThemeTarotCard({
  themeName,
  themeDescription,
  result,
  loading,
  error,
  disabled,
  onDraw,
  styleIndex,
}: ThemeTarotCardProps) {
  const s = STYLES[styleIndex % STYLES.length]
  return (
    <section
      className={`flex flex-col rounded-3xl border ${s.border} bg-gradient-to-br ${s.gradient} p-4 backdrop-blur-sm`}
      style={{ boxShadow: s.shadow }}
    >
      <h2 className={`mb-2 text-sm font-semibold ${s.title}`}>{themeName}</h2>
      <p className={`mb-3 text-[11px] ${s.textMuted}`}>{themeDescription}</p>
      <button
        type="button"
        onClick={onDraw}
        disabled={loading || disabled}
        className="mb-3 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 px-4 py-2 text-[11px] font-semibold text-black shadow-[0_0_20px_rgba(245,200,160,0.7)] disabled:opacity-60"
      >
        {loading ? `${themeName} 뽑는 중…` : `${themeName} 뽑기`}
      </button>
      {error && <p className="mb-2 text-[11px] text-red-200/90">에러: {error}</p>}
      {result ? (
        <div className={`mt-auto space-y-2 rounded-2xl border ${s.cardBorder} bg-black/40 p-3`}>
          <p className={`text-[10px] uppercase tracking-[0.18em] ${s.textMeta}`}>
            {result.themeName}
          </p>
          <p className={`text-sm font-semibold ${s.title}`}>
            {result.cardName}
            <span className={`ml-1 text-[10px] ${s.textMeta}`}>
              {result.cardNo}번 · {result.deckName}
            </span>
          </p>
          <p className={`text-[11px] ${s.textDesc}`}>{result.cardDescription}</p>
          <p className={`mt-2 whitespace-pre-wrap text-[11px] leading-relaxed ${s.textBody}`}>
            {result.resultText}
          </p>
        </div>
      ) : (
        <p className={`mt-auto text-[11px] ${s.textMuted}`}>
          버튼을 누르면 이번 달 {themeName} 메시지가 나타납니다.
        </p>
      )}
    </section>
  )
}

import { useState } from 'react'
import {
  type LoveSituation,
  type LoveTarotResponse,
  type ThemeTarotResponse,
  type TarotReadingHistoryItem,
  fetchTarotHistory,
  drawDailyTarot,
  drawLoveTarot,
  drawMonthlyTarot,
} from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { apiConfig, hasToken } = useAuth()

  const [loveSituation, setLoveSituation] = useState<LoveSituation>('SOME')
  const [loveResult, setLoveResult] = useState<LoveTarotResponse>()
  const [loveLoading, setLoveLoading] = useState(false)
  const [loveError, setLoveError] = useState<string>()

  const [careerThemeId] = useState<number>(2)
  const [careerResult, setCareerResult] = useState<ThemeTarotResponse>()
  const [careerLoading, setCareerLoading] = useState(false)
  const [careerError, setCareerError] = useState<string>()

  const [dailyResult, setDailyResult] = useState<ThemeTarotResponse>()
  const [dailyLoading, setDailyLoading] = useState(false)
  const [dailyError, setDailyError] = useState<string>()

  const [tarotHistory, setTarotHistory] = useState<TarotReadingHistoryItem[]>([])
  const [tarotHistoryLoading, setTarotHistoryLoading] = useState(false)
  const [tarotHistoryError, setTarotHistoryError] = useState<string>()

  const handleLove = async () => {
    setLoveLoading(true)
    setLoveError(undefined)
    try {
      const res = await drawLoveTarot(apiConfig, loveSituation)
      setLoveResult(res)
    } catch (e) {
      setLoveError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoveLoading(false)
    }
  }

  const handleCareer = async () => {
    setCareerLoading(true)
    setCareerError(undefined)
    try {
      const res = await drawMonthlyTarot(apiConfig, careerThemeId)
      setCareerResult(res)
    } catch (e) {
      setCareerError(e instanceof Error ? e.message : String(e))
    } finally {
      setCareerLoading(false)
    }
  }

  const handleDaily = async () => {
    setDailyLoading(true)
    setDailyError(undefined)
    try {
      const res = await drawDailyTarot(apiConfig)
      setDailyResult(res)
    } catch (e) {
      setDailyError(e instanceof Error ? e.message : String(e))
    } finally {
      setDailyLoading(false)
    }
  }

  const loadTarotHistory = async () => {
    setTarotHistoryLoading(true)
    setTarotHistoryError(undefined)
    try {
      const list = await fetchTarotHistory(apiConfig)
      setTarotHistory(list)
    } catch (e) {
      setTarotHistoryError(e instanceof Error ? e.message : String(e))
    } finally {
      setTarotHistoryLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-amber-100 md:text-3xl">
          오늘, 당신의 하루를 위한 테마별 타로
        </h1>
        <p className="mx-auto max-w-2xl text-xs text-purple-100/80">
          연애 · 커리어 · 전체 운세까지 한 번에 확인할 수 있는 개인 타로 대시보드입니다.
        </p>
      </header>

      <main className="grid gap-4 md:grid-cols-3">
        {/* 연애운 카드 */}
        <section className="flex flex-col rounded-3xl border border-pink-400/40 bg-gradient-to-br from-pink-900/60 via-black/70 to-purple-950/70 p-4 shadow-[0_0_35px_rgba(255,120,180,0.6)] backdrop-blur-sm">
          <h2 className="mb-2 text-sm font-semibold text-pink-100">연애운 타로</h2>
          <p className="mb-3 text-[11px] text-pink-50/80">
            지금 나의 연애 상황에 맞는 한 문단의 메시지를 전해드립니다.
          </p>
          <label className="mb-2 block text-[11px] font-medium text-pink-50/90">
            연애 상황 선택
            <select
              value={loveSituation}
              onChange={(e) => setLoveSituation(e.target.value as LoveSituation)}
              className="mt-1 w-full rounded-2xl border border-pink-400/40 bg-black/40 px-3 py-1.5 text-[11px] outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
            >
              <option value="SOME">SOME - 썸</option>
              <option value="REUNION">REUNION - 재회</option>
              <option value="COUPLE">COUPLE - 커플</option>
              <option value="SOLO">SOLO - 솔로</option>
              <option value="CRUSH">CRUSH - 짝사랑</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleLove}
            disabled={loveLoading || !hasToken}
            className="mb-3 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-pink-300 px-4 py-2 text-[11px] font-semibold text-black shadow-[0_0_20px_rgba(245,200,160,0.7)] disabled:opacity-60"
          >
            {loveLoading ? '연애운 뽑는 중…' : '연애운 뽑기'}
          </button>
          {loveError && (
            <p className="mb-2 text-[11px] text-red-200/90">에러: {loveError}</p>
          )}
          {loveResult ? (
            <div className="mt-auto space-y-2 rounded-2xl border border-pink-300/40 bg-black/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-pink-200/90">
                {loveResult.themeName}
              </p>
              <p className="text-sm font-semibold text-pink-50">
                {loveResult.cardName}
                <span className="ml-1 text-[10px] text-pink-200/80">
                  {loveResult.cardNo}번 · {loveResult.deckName}
                </span>
              </p>
              <p className="text-[11px] text-pink-100/90">
                상황: {loveResult.situationLabel} ({loveResult.situation})
              </p>
              <p className="mt-1 text-[11px] text-pink-50/90">{loveResult.cardDescription}</p>
              <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-pink-50/95">
                {loveResult.resultText}
              </p>
            </div>
          ) : (
            <p className="mt-auto text-[11px] text-pink-100/80">
              위에서 상황을 선택하고 연애운을 뽑으면, 오늘의 연애 메시지가 이곳에 나타납니다.
            </p>
          )}
        </section>

        {/* 커리어/월간 테마 카드 */}
        <section className="flex flex-col rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-900/60 via-black/70 to-purple-950/70 p-4 shadow-[0_0_35px_rgba(245,200,120,0.6)] backdrop-blur-sm">
          <h2 className="mb-2 text-sm font-semibold text-amber-100">이번 달 커리어 운세</h2>
          <p className="mb-3 text-[11px] text-amber-50/85">
            테마 ID 2(취업/이직운)를 사용해서, 이번 달 커리어 흐름을 한 번에 확인해 보세요.
          </p>
          <button
            type="button"
            onClick={handleCareer}
            disabled={careerLoading || !hasToken}
            className="mb-3 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 px-4 py-2 text-[11px] font-semibold text-black shadow-[0_0_20px_rgba(245,200,160,0.7)] disabled:opacity-60"
          >
            {careerLoading ? '커리어 운세 뽑는 중…' : '이번 달 커리어 운세 뽑기'}
          </button>
          {careerError && (
            <p className="mb-2 text-[11px] text-red-200/90">에러: {careerError}</p>
          )}
          {careerResult ? (
            <div className="mt-auto space-y-2 rounded-2xl border border-amber-300/40 bg-black/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/90">
                {careerResult.themeName}
              </p>
              <p className="text-sm font-semibold text-amber-50">
                {careerResult.cardName}
                <span className="ml-1 text-[10px] text-amber-200/80">
                  {careerResult.cardNo}번 · {careerResult.deckName}
                </span>
              </p>
              <p className="text-[11px] text-amber-100/90">{careerResult.cardDescription}</p>
              <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-amber-50/95">
                {careerResult.resultText}
              </p>
            </div>
          ) : (
            <p className="mt-auto text-[11px] text-amber-100/80">
              버튼을 누르면, 취업/이직을 포함한 이번 달 커리어 흐름을 보여주는 카드가 나타납니다.
            </p>
          )}
        </section>

        {/* 오늘의 운세 카드 */}
        <section className="flex flex-col rounded-3xl border border-purple-400/40 bg-gradient-to-br from-purple-900/60 via-black/70 to-slate-950/70 p-4 shadow-[0_0_35px_rgba(140,120,255,0.6)] backdrop-blur-sm">
          <h2 className="mb-2 text-sm font-semibold text-purple-100">오늘의 전체 운세</h2>
          <p className="mb-3 text-[11px] text-purple-50/85">
            themeId = 8 로 고정된 오늘의 운세 테마에서, 오늘 하루를 상징하는 카드를 한 장 뽑습니다.
          </p>
          <button
            type="button"
            onClick={handleDaily}
            disabled={dailyLoading || !hasToken}
            className="mb-3 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 px-4 py-2 text-[11px] font-semibold text-black shadow-[0_0_20px_rgba(200,180,255,0.7)] disabled:opacity-60"
          >
            {dailyLoading ? '오늘의 운세 뽑는 중…' : '오늘의 운세 뽑기'}
          </button>
          {dailyError && (
            <p className="mb-2 text-[11px] text-red-200/90">에러: {dailyError}</p>
          )}
          {dailyResult ? (
            <div className="mt-auto space-y-2 rounded-2xl border border-purple-300/40 bg-black/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-purple-200/90">
                {dailyResult.themeName}
              </p>
              <p className="text-sm font-semibold text-purple-50">
                {dailyResult.cardName}
                <span className="ml-1 text-[10px] text-purple-200/80">
                  {dailyResult.cardNo}번 · {dailyResult.deckName}
                </span>
              </p>
              <p className="text-[11px] text-purple-100/90">{dailyResult.cardDescription}</p>
              <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-purple-50/95">
                {dailyResult.resultText}
              </p>
            </div>
          ) : (
            <p className="mt-auto text-[11px] text-purple-100/80">
              오늘 하루를 여는 마음으로 버튼을 눌러 보세요. 카드가 오늘의 분위기를 조용히 알려줍니다.
            </p>
          )}
        </section>
      </main>

      <section className="rounded-3xl border border-purple-500/40 bg-black/40 p-4 text-left shadow-[0_0_35px_rgba(120,80,220,0.6)] backdrop-blur-sm md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-purple-100">나의 타로 히스토리</h2>
          <button
            type="button"
            onClick={() => {
              if (!hasToken) return
              void loadTarotHistory()
            }}
            disabled={!hasToken || tarotHistoryLoading}
            className="rounded-full bg-purple-400/90 px-3 py-1 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(180,140,255,0.7)] disabled:opacity-50"
          >
            {tarotHistoryLoading ? '불러오는 중…' : '히스토리 새로고침'}
          </button>
        </div>
        {!hasToken && (
          <p className="mb-2 text-[11px] text-purple-100/80">
            로그인 후 저장된 타로 리딩 히스토리를 확인할 수 있습니다.
          </p>
        )}
        {tarotHistoryError && (
          <p className="mb-2 text-[11px] text-red-200/90">
            히스토리 로드 실패: {tarotHistoryError}
          </p>
        )}
        <div className="max-h-60 space-y-2 overflow-y-auto pr-1 text-[11px] text-purple-50/95">
          {tarotHistory.length === 0 && !tarotHistoryLoading && hasToken && (
            <p className="text-purple-100/80">
              아직 저장된 타로 리딩 기록이 없습니다. 추후 `/api/tarot/reading` 기반 기록 저장
              화면과 연동하면, 이 타임라인에서 과거 리딩을 한눈에 볼 수 있습니다.
            </p>
          )}
          {tarotHistory.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-purple-500/40 bg-black/50 px-3 py-2"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-purple-100">
                  #{item.id} · {item.cardName}
                </p>
                <p className="text-[10px] text-purple-200/80">
                  {new Date(item.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <p className="mb-1 line-clamp-2 text-[11px] text-purple-100/90">
                Q. {item.question}
              </p>
              <p className="line-clamp-3 text-[11px] text-purple-50/90">{item.resultText}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'
import {
  type ApiConfig,
  type LoveSituation,
  type LoveTarotResponse,
  type ThemeTarotResponse,
  type LoginResult,
  login,
  type TarotReaderSummary,
  type ReservationSummary,
  type TarotReadingHistoryItem,
  fetchReaders,
  fetchReaderRanking,
  createReservation,
  fetchMyReservations,
  createReview,
  fetchTarotHistory,
  drawDailyTarot,
  drawLoveTarot,
  drawMonthlyTarot,
} from './lib/api'
import './App.css'
import { ChatPanel } from './components/ChatPanel'

function App() {
  const [baseUrl] = useState('http://localhost:8080')
  const [accessToken, setAccessToken] = useState<string | null>(
    () => window.localStorage.getItem('accessToken'),
  )
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const apiConfig: ApiConfig = {
    baseUrl,
    accessToken: accessToken?.trim() || undefined,
  }

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

  const hasToken = Boolean(apiConfig.accessToken)

  const [readers, setReaders] = useState<TarotReaderSummary[]>([])
  const [readersLoading, setReadersLoading] = useState(false)
  const [readersError, setReadersError] = useState<string>()

  const [ranking, setRanking] = useState<string[]>([])
  const [rankingLoading, setRankingLoading] = useState(false)
  const [rankingError, setRankingError] = useState<string>()

  const [selectedReaderId, setSelectedReaderId] = useState<number | null>(null)
  const [reservationTime, setReservationTime] = useState('')
  const [reservationLoading, setReservationLoading] = useState(false)
  const [reservationMessage, setReservationMessage] = useState<string>()

  const [myReservations, setMyReservations] = useState<ReservationSummary[]>([])
  const [myReservationsLoading, setMyReservationsLoading] = useState(false)
  const [myReservationsError, setMyReservationsError] = useState<string>()

  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewMessage, setReviewMessage] = useState<string>()

  const [tarotHistory, setTarotHistory] = useState<TarotReadingHistoryItem[]>([])
  const [tarotHistoryLoading, setTarotHistoryLoading] = useState(false)
  const [tarotHistoryError, setTarotHistoryError] = useState<string>()

  const handleLogin = async () => {
    setAuthLoading(true)
    setAuthError(undefined)
    try {
      const res: LoginResult = await login(apiConfig, { email, password })
      setAccessToken(res.accessToken)
      window.localStorage.setItem('accessToken', res.accessToken)
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : String(e))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setAccessToken(null)
    window.localStorage.removeItem('accessToken')
  }

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

  const loadReaders = async () => {
    setReadersLoading(true)
    setReadersError(undefined)
    try {
      const list = await fetchReaders(apiConfig)
      setReaders(list)
      if (!selectedReaderId && list.length > 0) {
        setSelectedReaderId(list[0].id)
      }
    } catch (e) {
      setReadersError(e instanceof Error ? e.message : String(e))
    } finally {
      setReadersLoading(false)
    }
  }

  const loadRanking = async () => {
    setRankingLoading(true)
    setRankingError(undefined)
    try {
      const list = await fetchReaderRanking(apiConfig)
      setRanking(list)
    } catch (e) {
      setRankingError(e instanceof Error ? e.message : String(e))
    } finally {
      setRankingLoading(false)
    }
  }

  const loadMyReservations = async () => {
    setMyReservationsLoading(true)
    setMyReservationsError(undefined)
    try {
      const list = await fetchMyReservations(apiConfig)
      setMyReservations(list)
    } catch (e) {
      setMyReservationsError(e instanceof Error ? e.message : String(e))
    } finally {
      setMyReservationsLoading(false)
    }
  }

  const handleCreateReservation = async () => {
    if (!selectedReaderId || !reservationTime) return
    setReservationLoading(true)
    setReservationMessage(undefined)
    try {
      const message = await createReservation(apiConfig, {
        readerId: selectedReaderId,
        reservationTime,
      })
      setReservationMessage(message)
      await loadMyReservations()
    } catch (e) {
      setReservationMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setReservationLoading(false)
    }
  }

  const handleCreateReview = async () => {
    if (!selectedReservationId || !reviewComment.trim()) return
    setReviewLoading(true)
    setReviewMessage(undefined)
    try {
      const message = await createReview(apiConfig, {
        reservationId: selectedReservationId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      setReviewMessage(message)
      setReviewComment('')
      await loadMyReservations()
    } catch (e) {
      setReviewMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setReviewLoading(false)
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
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-purple-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-10">
        <header className="space-y-3 pb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-purple-300/80">
            Tarot Insight
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-amber-100 md:text-4xl">
            오늘, 당신의 하루를 위한 테마별 타로
          </h1>
          <p className="mx-auto max-w-2xl text-xs text-purple-100/80">
            연애 · 커리어 · 전체 운세까지 한 번에 확인할 수 있는 개인 타로 대시보드입니다.
            <br />
            백엔드의 테마별 타로 API(`/api/tarot/themes`)를 그대로 사용해, 실제 서비스와 동일한 흐름으로
            결과를 보여줍니다.
          </p>
        </header>

        <section className="mb-5 rounded-3xl border border-purple-500/40 bg-black/40 p-4 text-left shadow-[0_0_35px_rgba(90,40,180,0.6)] backdrop-blur-sm md:p-5">
          <h2 className="mb-3 text-sm font-semibold text-amber-100">인증 & 접속 정보</h2>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <p className="block text-xs font-medium text-purple-100/90">
                백엔드 Base URL
                <span className="ml-1 rounded-full bg-purple-900/60 px-2 py-0.5 text-[10px] text-purple-200/90">
                  {baseUrl}
                </span>
              </p>
              <p className="mt-1 text-[10px] text-purple-200/80">
                환경에 맞게 `baseUrl` 을 조정해 사용합니다. (기본값: http://localhost:8080)
              </p>
              <p className="mt-2 text-[10px] text-purple-200/80">
                백엔드는 JWT 기반 보호 API이므로, 아래에서 로그인 후 발급받은 액세스 토큰을 자동으로
                사용합니다.
              </p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-medium text-purple-100/90">
                <span>로그인 (USER)</span>
                <span className="text-[10px] text-purple-300/80">
                  /api/auth/login · 토큰 localStorage 저장
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  className="rounded-2xl border border-purple-500/40 bg-black/50 px-3 py-2 text-xs outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="rounded-2xl border border-purple-500/40 bg-black/50 px-3 py-2 text-xs outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={authLoading || !email || !password}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 px-4 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(245,200,160,0.7)] disabled:opacity-60"
                >
                  {authLoading ? '로그인 중…' : '로그인'}
                </button>
                {accessToken && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-full border border-purple-400/60 px-3 py-1.5 text-[11px] font-semibold text-purple-100 hover:bg-purple-900/50"
                  >
                    로그아웃
                  </button>
                )}
              </div>
              {authError && (
                <p className="mt-2 text-[11px] text-red-200/90">로그인 실패: {authError}</p>
              )}
              {accessToken && !authError && (
                <p className="mt-1 text-[10px] text-emerald-200/90">
                  로그인 완료. 액세스 토큰이 localStorage에 저장되어, 아래 모든 카드 호출에 자동으로
                  사용됩니다.
                </p>
              )}
            </div>
          </div>
        </section>

        <main className="grid flex-1 gap-4 md:grid-cols-3">
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

        <section className="mt-6 rounded-3xl border border-emerald-400/40 bg-black/40 p-4 text-left shadow-[0_0_35px_rgba(80,200,170,0.6)] backdrop-blur-sm md:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-emerald-100">
              실시간 상담사 랭킹 & 예약 현황
            </h2>
            <div className="flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  if (!hasToken) return
                  void loadReaders()
                  void loadRanking()
                  void loadMyReservations()
                }}
                disabled={!hasToken || readersLoading || rankingLoading || myReservationsLoading}
                className="rounded-full bg-emerald-400/90 px-3 py-1 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(80,220,170,0.7)] disabled:opacity-50"
              >
                {readersLoading || rankingLoading || myReservationsLoading
                  ? '새로고치는 중…'
                  : '데이터 새로고침'}
              </button>
            </div>
          </div>

          {!hasToken && (
            <p className="mb-3 text-[11px] text-emerald-100/80">
              상담사 랭킹과 예약 기능은 로그인 후 사용할 수 있습니다. 위에서 먼저 로그인해 주세요.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-[12px] font-semibold text-emerald-100">실시간 TOP 5</h3>
              {rankingError && (
                <p className="mb-1 text-[11px] text-red-200/90">랭킹 로드 실패: {rankingError}</p>
              )}
              <ul className="space-y-1.5 text-[11px] text-emerald-50/95">
                {ranking.length === 0 && !rankingLoading && (
                  <li className="text-emerald-100/70">아직 랭킹 데이터가 없습니다.</li>
                )}
                {ranking.map((name, index) => (
                  <li key={name} className="flex items-center justify-between">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/80 text-[10px] font-semibold text-black">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate">{name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-[12px] font-semibold text-emerald-100">상담사 목록</h3>
              {readersError && (
                <p className="mb-1 text-[11px] text-red-200/90">상담사 로드 실패: {readersError}</p>
              )}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {readers.length === 0 && !readersLoading && (
                  <p className="text-[11px] text-emerald-100/70">
                    아직 활성화된 상담사가 없거나, 데이터를 불러오지 않았습니다.
                  </p>
                )}
                {readers.map((reader) => (
                  <button
                    key={reader.id}
                    type="button"
                    onClick={() => setSelectedReaderId(reader.id)}
                    className={`w-full rounded-2xl border px-3 py-2 text-left text-[11px] transition ${
                      selectedReaderId === reader.id
                        ? 'border-emerald-300/80 bg-emerald-900/40'
                        : 'border-emerald-500/30 bg-black/40 hover:border-emerald-300/60'
                    }`}
                  >
                    <p className="font-semibold text-emerald-50">{reader.nickname}</p>
                    <p className="mt-0.5 text-[10px] text-emerald-100/80">
                      경력 {reader.experienceYears}년 · 평점{' '}
                      {reader.rating != null ? reader.rating.toFixed(1) : 'N/A'}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] text-emerald-100/80">
                      {reader.profile}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[12px] font-semibold text-emerald-100">예약 생성 & 내 예약</h3>
              <div className="space-y-2">
                <label className="block text-[11px] text-emerald-100/90">
                  예약할 상담사
                  <select
                    value={selectedReaderId ?? ''}
                    onChange={(e) => setSelectedReaderId(Number(e.target.value) || null)}
                    className="mt-1 w-full rounded-2xl border border-emerald-500/40 bg-black/50 px-3 py-1.5 text-[11px] outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                  >
                    <option value="">상담사를 선택하세요</option>
                    {readers.map((reader) => (
                      <option key={reader.id} value={reader.id}>
                        {reader.nickname} (경력 {reader.experienceYears}년)
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[11px] text-emerald-100/90">
                  예약 시간 (예: 2026-03-15 14:00)
                  <input
                    type="text"
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="mt-1 w-full rounded-2xl border border-emerald-500/40 bg-black/50 px-3 py-1.5 text-[11px] outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleCreateReservation}
                  disabled={
                    !hasToken || reservationLoading || !selectedReaderId || !reservationTime
                  }
                  className="inline-flex items-center rounded-full bg-emerald-400/90 px-4 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(80,220,170,0.7)] disabled:opacity-50"
                >
                  {reservationLoading ? '예약 생성 중…' : '예약 생성'}
                </button>
                {reservationMessage && (
                  <p className="text-[11px] text-emerald-100/90">{reservationMessage}</p>
                )}
              </div>

              <div className="mt-3">
                <p className="mb-1 text-[11px] font-semibold text-emerald-100/90">
                  내 예약 목록 & 리뷰 대상 선택
                </p>
                {myReservationsError && (
                  <p className="mb-1 text-[11px] text-red-200/90">
                    예약 목록 로드 실패: {myReservationsError}
                  </p>
                )}
                <div className="max-h-32 space-y-1.5 overflow-y-auto pr-1 text-[11px] text-emerald-50/95">
                  {myReservations.length === 0 && !myReservationsLoading && (
                    <p className="text-emerald-100/70">
                      아직 생성된 예약이 없습니다. 상단에서 상담사와 시간을 선택해 첫 예약을 만들어 보세요.
                    </p>
                  )}
                  {myReservations.map((r) => (
                    <div
                      key={r.id}
                      className={`cursor-pointer rounded-2xl border px-3 py-1.5 ${
                        selectedReservationId === r.id
                          ? 'border-emerald-300/80 bg-emerald-900/40'
                          : 'border-emerald-500/30 bg-black/40 hover:border-emerald-300/60'
                      }`}
                      onClick={() => setSelectedReservationId(r.id)}
                    >
                      <p className="font-semibold">
                        #{r.id} · {r.readerName}
                      </p>
                      <p className="text-[10px] text-emerald-100/80">
                        시간: {new Date(r.reservationTime).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-[10px] text-emerald-100/80">상태: {r.status}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 border-t border-emerald-500/30 pt-2">
                <p className="mb-1 text-[11px] font-semibold text-emerald-100/90">
                  리뷰 작성 (완료된 상담 대상)
                </p>
                <div className="mb-2 flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-100/80">평점</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="rounded-full border border-emerald-500/40 bg-black/50 px-2 py-1 text-[11px] outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-emerald-100/70">/ 5</span>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="상담이 어떻게 도움이 되었는지 최대 500자까지 적어주세요."
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-2xl border border-emerald-500/40 bg-black/50 px-3 py-2 text-[11px] outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                />
                <button
                  type="button"
                  onClick={handleCreateReview}
                  disabled={
                    !hasToken || reviewLoading || !selectedReservationId || !reviewComment.trim()
                  }
                  className="mt-2 inline-flex items-center rounded-full bg-emerald-400/90 px-4 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(80,220,170,0.7)] disabled:opacity-50"
                >
                  {reviewLoading ? '리뷰 저장 중…' : '리뷰 등록'}
                </button>
                {reviewMessage && (
                  <p className="mt-1 text-[11px] text-emerald-100/90">{reviewMessage}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <ChatPanel apiConfig={apiConfig} roomId="1" />
        </div>

        <section className="mt-6 rounded-3xl border border-purple-500/40 bg-black/40 p-4 text-left shadow-[0_0_35px_rgba(120,80,220,0.6)] backdrop-blur-sm md:p-5">
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

        <footer className="mt-6 text-center text-[11px] text-purple-300/70">
          연애 · 커리어 · 오늘의 운세를 하나의 화면에서 확인하는 개인 타로 대시보드입니다. 백엔드의
          테마별 타로 설계와 자연스럽게 맞물리도록 구성되었습니다.
        </footer>
      </div>
    </div>
  )
}

export default App

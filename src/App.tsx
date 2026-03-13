import { useState } from 'react'
import {
  type ApiConfig,
  type LoveSituation,
  type LoveTarotResponse,
  type ThemeTarotResponse,
  drawDailyTarot,
  drawLoveTarot,
  drawMonthlyTarot,
} from './lib/api'
import './App.css'

type Panel = 'love' | 'monthly' | 'daily'

function App() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:8080')
  const [accessToken, setAccessToken] = useState('')
  const [activePanel, setActivePanel] = useState<Panel>('love')

  const apiConfig: ApiConfig = {
    baseUrl,
    accessToken: accessToken.trim() || undefined,
  }

  const [loveSituation, setLoveSituation] = useState<LoveSituation>('SOME')
  const [loveRequest, setLoveRequest] = useState('')
  const [loveResponse, setLoveResponse] = useState('')
  const [loveLoading, setLoveLoading] = useState(false)

  const [themeId, setThemeId] = useState<number>(2)
  const [monthlyRequest, setMonthlyRequest] = useState('')
  const [monthlyResponse, setMonthlyResponse] = useState('')
  const [monthlyLoading, setMonthlyLoading] = useState(false)

  const [dailyRequest, setDailyRequest] = useState('')
  const [dailyResponse, setDailyResponse] = useState('')
  const [dailyLoading, setDailyLoading] = useState(false)

  const pretty = (value: unknown) => {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  const handleLove = async () => {
    setLoveLoading(true)
    const reqBody = { situation: loveSituation }
    setLoveRequest(pretty(reqBody))
    setLoveResponse('요청 중...')

    try {
      const res: LoveTarotResponse = await drawLoveTarot(apiConfig, loveSituation)
      setLoveResponse(pretty(res))
    } catch (e) {
      setLoveResponse(`요청 실패:\n${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoveLoading(false)
    }
  }

  const handleMonthly = async () => {
    setMonthlyLoading(true)
    const reqBody = { themeId }
    setMonthlyRequest(pretty(reqBody))
    setMonthlyResponse('요청 중...')

    try {
      const res: ThemeTarotResponse = await drawMonthlyTarot(apiConfig, themeId)
      setMonthlyResponse(pretty(res))
    } catch (e) {
      setMonthlyResponse(`요청 실패:\n${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setMonthlyLoading(false)
    }
  }

  const handleDaily = async () => {
    setDailyLoading(true)
    setDailyRequest(`GET ${baseUrl}/api/tarot/themes/daily\n(Body 없음)`)
    setDailyResponse('요청 중...')

    try {
      const res: ThemeTarotResponse = await drawDailyTarot(apiConfig)
      setDailyResponse(pretty(res))
    } catch (e) {
      setDailyResponse(`요청 실패:\n${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setDailyLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-purple-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-10">
        <header className="space-y-3 pb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-purple-300/80">
            Tarot Insight · Theme Tarot API
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-amber-100 md:text-3xl">
            테마별 타로 백엔드와 맞춘 프론트 테스트 화면
          </h1>
          <p className="mx-auto max-w-2xl text-xs text-purple-100/80">
            `/api/tarot/themes/love`, `/monthly`, `/daily` 엔드포인트를 그대로 호출하는 프론트입니다.
            <br />
            아래에서 백엔드 Base URL 과 JWT 토큰을 입력한 뒤 각 섹션의 카드를 눌러 응답을 확인할 수 있어요.
          </p>
        </header>

        <section className="mb-5 rounded-3xl border border-purple-500/40 bg-black/40 p-4 text-left shadow-[0_0_35px_rgba(90,40,180,0.6)] backdrop-blur-sm md:p-5">
          <h2 className="mb-3 text-sm font-semibold text-amber-100">공통 설정</h2>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <label className="block text-xs font-medium text-purple-100/90">
                백엔드 Base URL
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-purple-500/40 bg-black/50 px-3 py-2 text-xs outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                />
              </label>
              <p className="mt-1 text-[10px] text-purple-200/80">예: http://localhost:8080</p>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-purple-100/90">
                JWT Access Token (USER)
                <input
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Bearer 없이 토큰만 입력"
                  className="mt-1 w-full rounded-2xl border border-purple-500/40 bg-black/50 px-3 py-2 text-xs outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                />
              </label>
              <p className="mt-1 text-[10px] text-purple-200/80">
                `/api/auth/login` 으로 USER 로그인 후 받은 accessToken 그대로 입력하세요.
              </p>
            </div>
          </div>
        </section>

        <nav className="mb-4 flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActivePanel('love')}
            className={`flex-1 rounded-full px-3 py-2 font-semibold uppercase tracking-[0.15em] ${
              activePanel === 'love'
                ? 'bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 text-black'
                : 'bg-purple-900/40 text-purple-100/80'
            }`}
          >
            연애운
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('monthly')}
            className={`flex-1 rounded-full px-3 py-2 font-semibold uppercase tracking-[0.15em] ${
              activePanel === 'monthly'
                ? 'bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 text-black'
                : 'bg-purple-900/40 text-purple-100/80'
            }`}
          >
            월간 테마
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('daily')}
            className={`flex-1 rounded-full px-3 py-2 font-semibold uppercase tracking-[0.15em] ${
              activePanel === 'daily'
                ? 'bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 text-black'
                : 'bg-purple-900/40 text-purple-100/80'
            }`}
          >
            오늘의 운세
          </button>
        </nav>

        <main className="flex-1 space-y-4 text-left">
          {activePanel === 'love' && (
            <section className="rounded-3xl border border-purple-500/40 bg-black/40 p-4 shadow-[0_0_35px_rgba(90,40,180,0.6)] backdrop-blur-sm md:p-5">
              <h2 className="mb-3 text-sm font-semibold text-amber-100">
                1. 연애운 타로 `/api/tarot/themes/love`
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-purple-100/90">
                      연애 상황 (situation)
                      <select
                        value={loveSituation}
                        onChange={(e) => setLoveSituation(e.target.value as LoveSituation)}
                        className="mt-1 w-full rounded-2xl border border-purple-500/40 bg-black/50 px-3 py-2 text-xs outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                      >
                        <option value="SOME">SOME - 썸</option>
                        <option value="REUNION">REUNION - 재회</option>
                        <option value="COUPLE">COUPLE - 커플</option>
                        <option value="SOLO">SOLO - 솔로</option>
                        <option value="CRUSH">CRUSH - 짝사랑</option>
                      </select>
                    </label>
                    <p className="mt-1 text-[10px] text-purple-200/80">
                      백엔드에는 코드(SOME/REUNION/COUPLE/SOLO/CRUSH)가 전달되고, 응답에는
                      situationLabel(썸/재회/...) 과 잘려진 resultText 가 내려옵니다.
                    </p>
                    <button
                      type="button"
                      onClick={handleLove}
                      disabled={loveLoading}
                      className="mt-2 inline-flex items-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 px-4 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(245,200,120,0.7)] disabled:opacity-60"
                    >
                      {loveLoading ? '연애운 뽑는 중…' : '연애운 뽑기'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-purple-200/90">요청 JSON</p>
                    <textarea
                      readOnly
                      value={loveRequest}
                      className="h-40 w-full rounded-2xl border border-purple-500/40 bg-black/60 p-2.5 text-[11px] font-mono text-purple-50"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-purple-200/90">응답 JSON</p>
                    <textarea
                      readOnly
                      value={loveResponse}
                      className="h-40 w-full rounded-2xl border border-purple-500/40 bg-black/60 p-2.5 text-[11px] font-mono text-purple-50"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePanel === 'monthly' && (
            <section className="rounded-3xl border border-purple-500/40 bg-black/40 p-4 shadow-[0_0_35px_rgba(90,40,180,0.6)] backdrop-blur-sm md:p-5">
              <h2 className="mb-3 text-sm font-semibold text-amber-100">
                2. 월간 테마 운세 `/api/tarot/themes/monthly`
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-purple-100/90">
                      테마 선택 (themeId)
                      <select
                        value={themeId}
                        onChange={(e) => setThemeId(Number(e.target.value))}
                        className="mt-1 w-full rounded-2xl border border-purple-500/40 bg-black/50 px-3 py-2 text-xs outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
                      >
                        <option value={2}>2 - 취업/이직운</option>
                        <option value={3}>3 - 합격/승진운</option>
                        <option value={4}>4 - 학업/성적운</option>
                        <option value={5}>5 - 금전/사업운</option>
                        <option value={6}>6 - 건강운</option>
                        <option value={7}>7 - 대인관계</option>
                      </select>
                    </label>
                    <p className="mt-1 text-[10px] text-purple-200/80">
                      ThemeTarotRequest.themeId (2~7 범위). 선택된 테마에서 랜덤 카드 1장, resultText
                      전체를 반환합니다.
                    </p>
                    <button
                      type="button"
                      onClick={handleMonthly}
                      disabled={monthlyLoading}
                      className="mt-2 inline-flex items-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 px-4 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(245,200,120,0.7)] disabled:opacity-60"
                    >
                      {monthlyLoading ? '월간 운세 뽑는 중…' : '월간 테마 운세 뽑기'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-purple-200/90">요청 JSON</p>
                    <textarea
                      readOnly
                      value={monthlyRequest}
                      className="h-40 w-full rounded-2xl border border-purple-500/40 bg-black/60 p-2.5 text-[11px] font-mono text-purple-50"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-purple-200/90">응답 JSON</p>
                    <textarea
                      readOnly
                      value={monthlyResponse}
                      className="h-40 w-full rounded-2xl border border-purple-500/40 bg-black/60 p-2.5 text-[11px] font-mono text-purple-50"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePanel === 'daily' && (
            <section className="rounded-3xl border border-purple-500/40 bg-black/40 p-4 shadow-[0_0_35px_rgba(90,40,180,0.6)] backdrop-blur-sm md:p-5">
              <h2 className="mb-3 text-sm font-semibold text-amber-100">
                3. 오늘의 운세 `/api/tarot/themes/daily`
              </h2>
              <div className="space-y-3">
                <p className="text-[10px] text-purple-200/80">
                  TarotThemeService.drawDailyTarot() → themeId = 8 고정으로 랜덤 카드 1장을 뽑습니다.
                </p>
                <button
                  type="button"
                  onClick={handleDaily}
                  disabled={dailyLoading}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 px-4 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(245,200,120,0.7)] disabled:opacity-60"
                >
                  {dailyLoading ? '오늘의 운세 뽑는 중…' : '오늘의 운세 뽑기'}
                </button>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-purple-200/90">요청 정보</p>
                    <textarea
                      readOnly
                      value={dailyRequest}
                      className="h-32 w-full rounded-2xl border border-purple-500/40 bg-black/60 p-2.5 text-[11px] font-mono text-purple-50"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-purple-200/90">응답 JSON</p>
                    <textarea
                      readOnly
                      value={dailyResponse}
                      className="h-32 w-full rounded-2xl border border-purple-500/40 bg-black/60 p-2.5 text-[11px] font-mono text-purple-50"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className="mt-6 text-center text-[11px] text-purple-300/70">
          백엔드 스펙과 1:1로 맞춘 테스트용 프론트입니다. 실제 유저 화면으로 확장할 때는 이 구조를
          바탕으로 카드 UI/연동만 변경하면 됩니다.
        </footer>
      </div>
    </div>
  )
}

export default App

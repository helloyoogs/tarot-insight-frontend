import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Layout() {
  const {
    baseUrl,
    email,
    password,
    setEmail,
    setPassword,
    authLoading,
    authError,
    me,
    meLoading,
    hasToken,
    login,
    logout,
  } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-purple-50">
      <header className="sticky top-0 z-10 border-b border-purple-500/30 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              className="text-xs font-medium uppercase tracking-[0.3em] text-purple-300/90 hover:text-amber-200/90"
            >
              Tarot Insight
            </NavLink>
            <nav className="flex gap-2 text-xs">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 font-medium transition ${
                    isActive
                      ? 'bg-purple-500/40 text-amber-100'
                      : 'text-purple-200/80 hover:bg-purple-500/20 hover:text-purple-100'
                  }`
                }
              >
                타로 대시보드
              </NavLink>
              <NavLink
                to="/consultation"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 font-medium transition ${
                    isActive
                      ? 'bg-purple-500/40 text-amber-100'
                      : 'text-purple-200/80 hover:bg-purple-500/20 hover:text-purple-100'
                  }`
                }
              >
                상담 예약
              </NavLink>
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden text-[10px] text-purple-300/70 sm:inline">{baseUrl}</span>
            {!hasToken ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  className="w-32 rounded-full border border-purple-500/40 bg-black/50 px-2.5 py-1.5 text-[11px] outline-none focus:border-amber-300/60"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-28 rounded-full border border-purple-500/40 bg-black/50 px-2.5 py-1.5 text-[11px] outline-none focus:border-amber-300/60"
                />
                <button
                  type="button"
                  onClick={() => void login()}
                  disabled={authLoading || !email || !password}
                  className="rounded-full bg-gradient-to-r from-amber-300/90 to-purple-300/90 px-3 py-1.5 text-[11px] font-semibold text-black disabled:opacity-50"
                >
                  {authLoading ? '로그인 중…' : '로그인'}
                </button>
              </>
            ) : (
              <>
                <span className="max-w-40 truncate rounded-full bg-purple-900/60 px-2.5 py-1 text-[10px] text-emerald-200/90">
                  {meLoading ? '조회 중…' : me ?? '인증됨'}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-purple-400/50 px-2.5 py-1 text-[11px] font-medium text-purple-100 hover:bg-purple-900/50"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
        {authError && (
          <p className="mx-auto max-w-5xl px-4 pb-2 text-[11px] text-red-200/90">{authError}</p>
        )}
      </header>

      <main className="mx-auto max-w-5xl flex-1 px-4 pb-10 pt-6">
        <Outlet />
      </main>

      <footer className="border-t border-purple-500/20 py-4 text-center text-[11px] text-purple-300/60">
        연애 · 커리어 · 오늘의 운세와 상담 예약을 한곳에서. 백엔드 테마별 타로·JWT·예약·채팅 API와
        연동된 포트폴리오 프론트입니다.
      </footer>
    </div>
  )
}

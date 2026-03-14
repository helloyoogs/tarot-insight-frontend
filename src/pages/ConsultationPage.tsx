import { useState } from 'react'
import {
  type ReservationSummary,
  type TarotReaderSummary,
  cancelReservation,
  createReservation,
  createReview,
  fetchMyReservations,
  fetchReaderRanking,
  fetchReaders,
} from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { ChatPanel } from '../components/ChatPanel'

export default function ConsultationPage() {
  const { apiConfig, hasToken } = useAuth()

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

  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const canCancelReservation = (r: ReservationSummary) => {
    if (r.status === 'CANCELLED') return false
    const at = new Date(r.reservationTime).getTime()
    const now = Date.now()
    return at - now > 24 * 60 * 60 * 1000
  }

  const loadReaders = async () => {
    setReadersLoading(true)
    setReadersError(undefined)
    try {
      const list = await fetchReaders(apiConfig)
      setReaders(list)
      if (!selectedReaderId && list.length > 0) setSelectedReaderId(list[0].id)
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
      setRanking(await fetchReaderRanking(apiConfig))
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
      setMyReservations(await fetchMyReservations(apiConfig))
    } catch (e) {
      setMyReservationsError(e instanceof Error ? e.message : String(e))
    } finally {
      setMyReservationsLoading(false)
    }
  }

  const handleRefresh = () => {
    if (!hasToken) return
    void loadReaders()
    void loadRanking()
    void loadMyReservations()
  }

  const handleCreateReservation = async () => {
    if (!selectedReaderId || !reservationTime) return
    setReservationLoading(true)
    setReservationMessage(undefined)
    try {
      setReservationMessage(
        await createReservation(apiConfig, {
          readerId: selectedReaderId,
          reservationTime,
        }),
      )
      await loadMyReservations()
    } catch (e) {
      setReservationMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setReservationLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: number) => {
    setCancellingId(reservationId)
    try {
      setReservationMessage(await cancelReservation(apiConfig, reservationId))
      await loadMyReservations()
    } catch (e) {
      setReservationMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setCancellingId(null)
    }
  }

  const handleCreateReview = async () => {
    if (!selectedReservationId || !reviewComment.trim()) return
    setReviewLoading(true)
    setReviewMessage(undefined)
    try {
      setReviewMessage(
        await createReview(apiConfig, {
          reservationId: selectedReservationId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      )
      setReviewComment('')
      await loadMyReservations()
    } catch (e) {
      setReviewMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-amber-100 md:text-3xl">
          상담 예약 & 실시간 채팅
        </h1>
        <p className="mt-1 text-xs text-purple-100/80">
          상담사 랭킹·예약·리뷰·채팅을 한 화면에서 이용할 수 있습니다.
        </p>
      </div>

      <section className="rounded-3xl border border-emerald-400/40 bg-black/40 p-4 text-left shadow-[0_0_35px_rgba(80,200,170,0.6)] backdrop-blur-sm md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-emerald-100">
            실시간 상담사 랭킹 & 예약 현황
          </h2>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!hasToken || readersLoading || rankingLoading || myReservationsLoading}
            className="rounded-full bg-emerald-400/90 px-3 py-1 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(80,220,170,0.7)] disabled:opacity-50"
          >
            {readersLoading || rankingLoading || myReservationsLoading
              ? '새로고치는 중…'
              : '데이터 새로고침'}
          </button>
        </div>

        {!hasToken && (
          <p className="mb-3 text-[11px] text-emerald-100/80">
            상담사 랭킹과 예약 기능은 로그인 후 사용할 수 있습니다. 상단에서 먼저 로그인해 주세요.
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
            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
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
                  className="mt-1 w-full rounded-2xl border border-emerald-500/40 bg-black/50 px-3 py-1.5 text-[11px] outline-none focus:border-amber-300/80 focus:ring-amber-300/40"
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
                  className="mt-1 w-full rounded-2xl border border-emerald-500/40 bg-black/50 px-3 py-1.5 text-[11px] outline-none focus:border-amber-300/80 focus:ring-amber-300/40"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleCreateReservation()}
                disabled={
                  !hasToken || reservationLoading || !selectedReaderId || !reservationTime
                }
                className="inline-flex rounded-full bg-emerald-400/90 px-4 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(80,220,170,0.7)] disabled:opacity-50"
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
                    아직 생성된 예약이 없습니다. 상단에서 상담사와 시간을 선택해 첫 예약을 만들어
                    보세요.
                  </p>
                )}
                {myReservations.map((r) => {
                  const canCancel = canCancelReservation(r)
                  return (
                    <div
                      key={r.id}
                      className={`cursor-pointer rounded-2xl border px-3 py-1.5 ${
                        selectedReservationId === r.id
                          ? 'border-emerald-300/80 bg-emerald-900/40'
                          : 'border-emerald-500/30 bg-black/40 hover:border-emerald-300/60'
                      }`}
                      onClick={() => setSelectedReservationId(r.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            #{r.id} · {r.readerName}
                          </p>
                          <p className="text-[10px] text-emerald-100/80">
                            시간: {new Date(r.reservationTime).toLocaleString('ko-KR')}
                          </p>
                          <p className="text-[10px] text-emerald-100/80">상태: {r.status}</p>
                        </div>
                        {r.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (canCancel) void handleCancelReservation(r.id)
                            }}
                            disabled={!canCancel || cancellingId === r.id}
                            className="shrink-0 rounded-full border border-red-400/60 bg-red-950/50 px-2 py-0.5 text-[10px] font-semibold text-red-100 hover:bg-red-900/60 disabled:opacity-50"
                          >
                            {cancellingId === r.id
                              ? '취소 중…'
                              : canCancel
                                ? '예약 취소'
                                : '24h 이내'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
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
                  className="rounded-full border border-emerald-500/40 bg-black/50 px-2 py-1 text-[11px] outline-none focus:border-amber-300/80"
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
                className="w-full rounded-2xl border border-emerald-500/40 bg-black/50 px-3 py-2 text-[11px] outline-none focus:border-amber-300/80"
              />
              <button
                type="button"
                onClick={() => void handleCreateReview()}
                disabled={
                  !hasToken || reviewLoading || !selectedReservationId || !reviewComment.trim()
                }
                className="mt-2 inline-flex rounded-full bg-emerald-400/90 px-4 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(80,220,170,0.7)] disabled:opacity-50"
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

      <ChatPanel apiConfig={apiConfig} roomId="1" />
    </div>
  )
}

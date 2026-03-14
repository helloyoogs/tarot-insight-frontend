export interface ApiConfig {
  baseUrl: string
  accessToken?: string
}

// ===== Auth =====

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
}

export interface SignupPayload {
  email: string
  password: string
  nickname: string
  role?: 'USER' | 'READER'
}

export async function login(config: ApiConfig, payload: LoginPayload): Promise<LoginResult> {
  return request<LoginResult>(config, '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function signup(config: ApiConfig, payload: SignupPayload): Promise<string> {
  // 백엔드 응답은 단순 메시지(String) 이므로 제네릭을 string 으로 설정
  return request<string>(config, '/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getMe(config: ApiConfig): Promise<string> {
  return request<string>(config, '/api/users/me', {
    method: 'GET',
  })
}

// ===== Tarot Theme =====

export type LoveSituation = 'SOME' | 'REUNION' | 'COUPLE' | 'SOLO' | 'CRUSH'

export interface LoveTarotResponse {
  themeId: number
  themeName: string
  cardNo: number
  cardName: string
  cardDescription: string
  cardImageUrl: string
  deckName: string
  situation: LoveSituation
  situationLabel: string
  resultText: string
}

export interface ThemeTarotResponse {
  themeId: number
  themeName: string
  cardNo: number
  cardName: string
  cardDescription: string
  cardImageUrl: string
  deckName: string
  resultText: string
}

export interface TarotReadingHistoryItem {
  id: number
  cardName: string
  question: string
  resultText: string
  createdAt: string
}

// ===== Readers & Reservations =====

export interface TarotReaderSummary {
  id: number
  nickname: string
  profile: string
  experienceYears: number
  rating: number | null
}

export interface ReservationSummary {
  id: number
  userName: string
  readerName: string
  reservationTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export interface ReviewRequestPayload {
  reservationId: number
  rating: number
  comment: string
}

export async function fetchReaders(config: ApiConfig): Promise<TarotReaderSummary[]> {
  return request<TarotReaderSummary[]>(config, '/api/readers', {
    method: 'GET',
  })
}

export async function fetchReaderRanking(config: ApiConfig): Promise<string[]> {
  return request<string[]>(config, '/api/readers/ranking', {
    method: 'GET',
  })
}

export async function createReservation(
  config: ApiConfig,
  payload: { readerId: number; reservationTime: string },
): Promise<string> {
  return request<string>(config, '/api/reservations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchMyReservations(config: ApiConfig): Promise<ReservationSummary[]> {
  return request<ReservationSummary[]>(config, '/api/reservations/my', {
    method: 'GET',
  })
}

export async function cancelReservation(
  config: ApiConfig,
  reservationId: number,
): Promise<string> {
  return request<string>(config, `/api/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
  })
}

export async function createReview(
  config: ApiConfig,
  payload: ReviewRequestPayload,
): Promise<string> {
  return request<string>(config, '/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchTarotHistory(
  config: ApiConfig,
): Promise<TarotReadingHistoryItem[]> {
  return request<TarotReadingHistoryItem[]>(config, '/api/tarot/history', {
    method: 'GET',
  })
}

function buildHeaders(config: ApiConfig): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (config.accessToken) {
    headers.Authorization = `Bearer ${config.accessToken}`
  }

  return headers
}

async function request<T>(config: ApiConfig, path: string, init?: RequestInit): Promise<T> {
  const url = `${config.baseUrl.replace(/\/+$/, '')}${path}`

  const response = await fetch(url, {
    ...init,
    headers: {
      ...buildHeaders(config),
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  let json: unknown

  try {
    json = text ? JSON.parse(text) : undefined
  } catch {
    json = { raw: text }
  }

  if (!response.ok) {
    const message =
      typeof (json as any)?.message === 'string'
        ? (json as any).message
        : `요청 실패 (HTTP ${response.status})`
    throw new Error(message)
  }

  // 백엔드가 JSON이 아닌 평문(plain text)을 반환한 경우: { raw: text } 대신 문자열 반환
  if (
    json != null &&
    typeof json === 'object' &&
    'raw' in json &&
    Object.keys(json).length === 1 &&
    typeof (json as { raw: string }).raw === 'string'
  ) {
    return (json as { raw: string }).raw as T
  }

  return json as T
}

export async function drawLoveTarot(
  config: ApiConfig,
  situation: LoveSituation,
): Promise<LoveTarotResponse> {
  return request<LoveTarotResponse>(config, '/api/tarot/themes/love', {
    method: 'POST',
    body: JSON.stringify({ situation }),
  })
}

export async function drawMonthlyTarot(
  config: ApiConfig,
  themeId: number,
): Promise<ThemeTarotResponse> {
  return request<ThemeTarotResponse>(config, '/api/tarot/themes/monthly', {
    method: 'POST',
    body: JSON.stringify({ themeId }),
  })
}

export async function drawDailyTarot(config: ApiConfig): Promise<ThemeTarotResponse> {
  return request<ThemeTarotResponse>(config, '/api/tarot/themes/daily', {
    method: 'GET',
  })
}


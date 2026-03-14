import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  type ApiConfig,
  type LoginResult,
  getMe,
  login as apiLogin,
  reissue as apiReissue,
  signup as apiSignup,
} from '../lib/api'

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

interface AuthState {
  baseUrl: string
  accessToken: string | null
  refreshToken: string | null
  email: string
  password: string
  authLoading: boolean
  authError: string | undefined
  me: string | undefined
  meLoading: boolean
}

interface AuthContextValue extends AuthState {
  setEmail: (v: string) => void
  setPassword: (v: string) => void
  apiConfig: ApiConfig
  hasToken: boolean
  login: () => Promise<void>
  logout: () => void
  loadMe: (configOverride?: ApiConfig) => Promise<void>
  signup: (payload: { email: string; password: string; nickname: string; role?: 'USER' | 'READER' }) => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEFAULT_BASE = 'http://localhost:8080'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [baseUrl] = useState(DEFAULT_BASE)
  const [accessToken, setAccessToken] = useState<string | null>(
    () => window.localStorage.getItem(ACCESS_KEY),
  )
  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => window.localStorage.getItem(REFRESH_KEY),
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | undefined>()
  const [me, setMe] = useState<string | undefined>()
  const [meLoading, setMeLoading] = useState(false)

  const apiConfig: ApiConfig = useMemo(
    () => ({
      baseUrl,
      accessToken: accessToken?.trim() || undefined,
    }),
    [baseUrl, accessToken],
  )
  const hasToken = Boolean(apiConfig.accessToken)

  const loadMe = useCallback(
    async (configOverride?: ApiConfig) => {
      const config = configOverride ?? apiConfig
      if (!config.accessToken) return
      setMeLoading(true)
      try {
        const info = await getMe(config)
        setMe(info)
        setAuthError(undefined)
      } catch (e) {
        const err = e as Error & { status?: number }
        if (err.status === 401 && refreshToken?.trim()) {
          try {
            const res = await apiReissue(
              { baseUrl: config.baseUrl },
              refreshToken.trim(),
            )
            setAccessToken(res.accessToken)
            setRefreshToken(res.refreshToken)
            window.localStorage.setItem(ACCESS_KEY, res.accessToken)
            window.localStorage.setItem(REFRESH_KEY, res.refreshToken)
            const nextConfig = { ...config, accessToken: res.accessToken }
            const info = await getMe(nextConfig)
            setMe(info)
            setAuthError(undefined)
          } catch (reissueErr) {
            setAuthError(reissueErr instanceof Error ? reissueErr.message : String(reissueErr))
            setAccessToken(null)
            setRefreshToken(null)
            window.localStorage.removeItem(ACCESS_KEY)
            window.localStorage.removeItem(REFRESH_KEY)
          }
        } else {
          setAuthError(err instanceof Error ? err.message : String(e))
        }
      } finally {
        setMeLoading(false)
      }
    },
    [apiConfig, refreshToken],
  )

  useEffect(() => {
    if (apiConfig.accessToken) {
      void loadMe()
    }
  }, [apiConfig.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async () => {
    setAuthLoading(true)
    setAuthError(undefined)
    try {
      const res: LoginResult = await apiLogin(apiConfig, { email, password })
      setAccessToken(res.accessToken)
      setRefreshToken(res.refreshToken)
      window.localStorage.setItem(ACCESS_KEY, res.accessToken)
      window.localStorage.setItem(REFRESH_KEY, res.refreshToken)
      await loadMe({ ...apiConfig, accessToken: res.accessToken })
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : String(e))
    } finally {
      setAuthLoading(false)
    }
  }, [apiConfig, email, password, loadMe])

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    window.localStorage.removeItem(ACCESS_KEY)
    window.localStorage.removeItem(REFRESH_KEY)
    setMe(undefined)
    setAuthError(undefined)
  }, [])

  const signup = useCallback(
    async (payload: { email: string; password: string; nickname: string; role?: 'USER' | 'READER' }) => {
      return apiSignup({ baseUrl: apiConfig.baseUrl }, payload)
    },
    [apiConfig.baseUrl],
  )

  const value: AuthContextValue = useMemo(
    () => ({
      baseUrl,
      accessToken,
      refreshToken,
      email,
      password,
      authLoading,
      authError,
      me,
      meLoading,
      setEmail,
      setPassword,
      apiConfig,
      hasToken,
      login,
      logout,
      loadMe,
      signup,
    }),
    [
      baseUrl,
      accessToken,
      refreshToken,
      email,
      password,
      authLoading,
      authError,
      me,
      meLoading,
      apiConfig,
      hasToken,
      login,
      logout,
      loadMe,
      signup,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

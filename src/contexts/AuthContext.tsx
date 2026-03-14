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
} from '../lib/api'

interface AuthState {
  baseUrl: string
  accessToken: string | null
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
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEFAULT_BASE = 'http://localhost:8080'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [baseUrl] = useState(DEFAULT_BASE)
  const [accessToken, setAccessToken] = useState<string | null>(
    () => window.localStorage.getItem('accessToken'),
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
        setAuthError(e instanceof Error ? e.message : String(e))
      } finally {
        setMeLoading(false)
      }
    },
    [apiConfig],
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
      window.localStorage.setItem('accessToken', res.accessToken)
      await loadMe({ ...apiConfig, accessToken: res.accessToken })
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : String(e))
    } finally {
      setAuthLoading(false)
    }
  }, [apiConfig, email, password, loadMe])

  const logout = useCallback(() => {
    setAccessToken(null)
    window.localStorage.removeItem('accessToken')
    setMe(undefined)
    setAuthError(undefined)
  }, [])

  const value: AuthContextValue = useMemo(
    () => ({
      baseUrl,
      accessToken,
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
    }),
    [
      baseUrl,
      accessToken,
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
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

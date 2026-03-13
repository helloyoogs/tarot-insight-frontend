import { useEffect, useRef, useState } from 'react'
import type { ApiConfig } from '../lib/api'
import SockJS from 'sockjs-client'
import { CompatClient, Stomp } from '@stomp/stompjs'

type MessageType = 'ENTER' | 'TALK'

interface ChatMessage {
  roomId: string
  sender: string
  message?: string
  type: MessageType
}

interface ChatPanelProps {
  apiConfig: ApiConfig
  roomId: string
}

export function ChatPanel({ apiConfig, roomId }: ChatPanelProps) {
  const [sender, setSender] = useState('손님')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState<string>()

  const clientRef = useRef<CompatClient | null>(null)
  const chatBoxRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    const el = chatBoxRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!apiConfig.baseUrl) return

    const socket = new SockJS(`${apiConfig.baseUrl.replace(/\/+$/, '')}/ws-tarot`)
    const client: CompatClient = Stomp.over(socket)
    client.debug = () => {} // 콘솔 디버그 끔

    client.connect(
      {},
      () => {
        setConnected(true)
        setError(undefined)

        // 과거 대화 로드
        void (async () => {
          setLoadingHistory(true)
          try {
            const res = await fetch(
              `${apiConfig.baseUrl.replace(/\/+$/, '')}/api/chat/room/${roomId}`,
            )
            if (!res.ok) throw new Error(`이전 기록 로드 실패 (HTTP ${res.status})`)
            const data = (await res.json()) as ChatMessage[]
            setMessages((prev) => [...prev, ...data])
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
          } finally {
            setLoadingHistory(false)
          }
        })()

        // 실시간 구독
        client.subscribe(`/sub/chat/room/${roomId}`, (frame) => {
          const body = JSON.parse(frame.body) as ChatMessage
          setMessages((prev) => [...prev, body])
        })

        // 입장 메시지
        client.send(
          '/pub/chat/message',
          {},
          JSON.stringify({
            roomId,
            sender,
            type: 'ENTER',
          } satisfies ChatMessage),
        )
      },
      (err: unknown) => {
        setConnected(false)
        setError(`WebSocket 연결 실패: ${String(err)}`)
      },
    )

    clientRef.current = client

    return () => {
      client.disconnect(() => {
        setConnected(false)
      })
    }
  }, [apiConfig.baseUrl, roomId, sender])

  const sendMessage = () => {
    if (!clientRef.current || !connected || !input.trim()) return
    const payload: ChatMessage = {
      roomId,
      sender,
      message: input.trim(),
      type: 'TALK',
    }
    clientRef.current.send('/pub/chat/message', {}, JSON.stringify(payload))
    setInput('')
  }

  return (
    <section className="rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-900/60 via-black/70 to-purple-950/70 p-4 shadow-[0_0_35px_rgba(90,180,255,0.6)] backdrop-blur-sm">
      <h2 className="mb-2 text-sm font-semibold text-sky-100">실시간 상담 채팅 (Room: {roomId})</h2>
      <p className="mb-3 text-[11px] text-sky-50/85">
        WebSocket(STOMP) 기반으로, 백엔드 Redis Pub/Sub 채팅 인프라와 직접 연결된 상담실입니다.
      </p>

      <div
        ref={chatBoxRef}
        className="mb-3 flex h-52 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-sky-500/40 bg-black/40 p-3 text-[11px]"
      >
        {loadingHistory && (
          <p className="text-sky-200/80">이전 대화를 불러오는 중입니다…</p>
        )}
        {error && <p className="text-red-200/90">에러: {error}</p>}
        {!loadingHistory && messages.length === 0 && !error && (
          <p className="text-sky-100/80">
            아직 대화가 없습니다. 아래에서 메시지를 보내 첫 상담을 시작해 보세요.
          </p>
        )}
        {messages.map((m, idx) => (
          <p key={idx} className="leading-snug">
            {m.type === 'ENTER' ? (
              <span className="text-[10px] text-sky-200/80 italic">
                [알림] {m.message || `${m.sender}님이 입장하셨습니다.`}
              </span>
            ) : (
              <>
                <span className="font-semibold text-sky-100">{m.sender}</span>
                <span className="mx-1 text-sky-300/70">:</span>
                <span className="text-sky-50/95">{m.message}</span>
              </>
            )}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          type="text"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          placeholder="닉네임"
          className="w-full rounded-2xl border border-sky-500/40 bg-black/50 px-3 py-1.5 text-[11px] outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40 md:w-32"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder="상담 메시지를 입력하세요…"
          className="flex-1 rounded-2xl border border-sky-500/40 bg-black/50 px-3 py-1.5 text-[11px] outline-none ring-1 ring-transparent transition focus:border-amber-300/80 focus:ring-amber-300/40"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!connected || !input.trim()}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-300 via-emerald-300 to-purple-300 px-4 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_16px_rgba(140,210,255,0.7)] disabled:opacity-50 md:mt-0"
        >
          {connected ? '전송' : '연결 중…'}
        </button>
      </div>
    </section>
  )
}


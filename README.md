# Tarot Insight — Frontend

타로 인사이트 서비스의 웹 프론트엔드입니다. Spring Boot 백엔드와 1:1로 연동되는 포트폴리오용 클라이언트입니다.

## 기술 스택

- **Runtime**: Node.js 18+
- **빌드**: Vite 7
- **프레임워크**: React 19 + TypeScript (strict)
- **라우팅**: React Router v7
- **실시간 통신**: SockJS + STOMP (WebSocket)
- **스타일**: CSS Modules / 전역 CSS

## 주요 기능

- **인증**: 로그인 / 회원가입, JWT 기반 인증
- **테마 타로**: 연애운, 월간(커리어), 오늘의 운세
- **상담사**: 실시간 TOP 5, 상담사 목록, 예약 생성·조회·취소(24시간 규칙)
- **리뷰**: 예약별 평점·코멘트 작성
- **채팅**: STOMP 채팅방 히스토리 조회 및 실시간 메시지
- **히스토리**: 나의 타로 결과 타임라인

## 실행 방법

### 사전 요구사항

- 백엔드 서버가 `http://localhost:8080`에서 동작 중이어야 합니다.

### 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 빌드

```bash
npm run build
```

산출물은 `dist/`에 생성됩니다.

## 백엔드 연동

- **Base URL**: 기본값 `http://localhost:8080` (화면에서 변경 가능)
- **인증**: `Authorization: Bearer <accessToken>` 헤더
- **API**: REST (인증, 타로, 상담사, 예약, 리뷰, 히스토리) + STOMP 채팅

## 프로젝트 구조 (요약)

```
src/
├── App.tsx           # 라우터 셸 (BrowserRouter + Routes)
├── App.css
├── main.tsx
├── lib/
│   └── api.ts        # API 클라이언트 (공통 request, JWT, 엔드포인트)
├── components/
│   └── ChatPanel.tsx # STOMP 채팅 패널
└── pages/
    └── Dashboard.tsx # 메인 대시보드 (로그인, 타로, 상담사, 예약, 리뷰, 채팅, 히스토리)
```

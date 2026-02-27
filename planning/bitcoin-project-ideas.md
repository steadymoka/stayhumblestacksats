# Bitcoin Open Source Project Ideas

> "Stay Humble, Stack Sats"

## 1. Sat Stacking DCA Tracker

**한줄 요약**: 비트코인 적립식 투자(DCA)를 추적하고 시각화하는 웹앱

**문제 정의**
- 매일/매주/매월 비트코인을 적립하는 사람들이 자신의 누적 수익률과 평균 매입가를 한눈에 보기 어려움
- 기존 포트폴리오 앱은 법정화폐(KRW/USD) 기준이라 사토시 기준 사고가 부족

**핵심 기능**
- DCA 스케줄 설정 (일/주/월 단위)
- 사토시(sats) 기준 포트폴리오 대시보드
- 역대 DCA 시뮬레이션 (과거 데이터 기반 백테스트)
- 법정화폐 vs 비트코인 구매력 비교 차트

**기술 스택 (예시)**: React/Next.js, CoinGecko API, Chart.js, SQLite

**난이도**: ★★☆☆☆

---

## 2. Bitcoin Mempool Visualizer

**한줄 요약**: 비트코인 멤풀(미확인 트랜잭션 대기열)을 실시간으로 시각화

**문제 정의**
- 트랜잭션 수수료를 적절하게 설정하려면 현재 멤풀 상태를 알아야 함
- mempool.space가 있지만, 더 직관적이고 교육적인 시각화가 가능

**핵심 기능**
- 실시간 멤풀 트랜잭션 스트리밍 시각화 (버블/파티클 형태)
- 수수료 구간별 대기 트랜잭션 히트맵
- 예상 확인 시간 계산기
- 블록 채굴 시 트랜잭션 처리 애니메이션

**기술 스택 (예시)**: D3.js / Three.js, WebSocket, Bitcoin Core RPC / mempool.space API

**난이도**: ★★★☆☆

---

## 3. Lightning Network Tip Jar

**한줄 요약**: 크리에이터를 위한 라이트닝 네트워크 기반 후원(팁) 서비스

**문제 정의**
- 기존 후원 플랫폼은 높은 수수료와 중개자 의존
- 라이트닝 네트워크로 즉시, 저수수료, 글로벌 후원 가능

**핵심 기능**
- 개인 팁 페이지 생성 (username.tip)
- LNURL / Lightning Address 기반 결제
- QR 코드 생성 및 공유
- 후원 메시지 + 금액 실시간 표시 (스트리밍 오버레이)
- 누적 후원 통계 대시보드

**기술 스택 (예시)**: Next.js, LND/CLN, LNURL, bolt11, WebSocket

**난이도**: ★★★☆☆

---

## 4. Bitcoin Node Dashboard

**한줄 요약**: 자신의 비트코인 풀노드 상태를 모니터링하는 대시보드

**문제 정의**
- 비트코인 풀노드를 운영하면서 상태를 직관적으로 확인하기 어려움
- Umbrel/Start9 같은 솔루션이 있지만, 가볍고 커스터마이징 가능한 대시보드가 필요

**핵심 기능**
- 노드 동기화 상태, 피어 연결, 블록 높이 실시간 표시
- 네트워크 트래픽 모니터링
- 멤풀 상태 요약
- 시스템 리소스(CPU, RAM, 디스크) 사용량
- 모바일 반응형 UI

**기술 스택 (예시)**: Go 또는 Rust (백엔드), Svelte/React (프론트), Bitcoin Core RPC

**난이도**: ★★★★☆

---

## 5. On-chain Analytics Explorer

**한줄 요약**: 비트코인 온체인 데이터를 분석하고 시각화하는 탐색기

**문제 정의**
- Glassnode, CryptoQuant 등의 온체인 분석 서비스는 유료이거나 제한적
- 오픈소스로 누구나 온체인 지표를 조회할 수 있어야 함

**핵심 기능**
- 주요 온체인 지표 시각화 (MVRV, SOPR, NUPL 등)
- 고래 지갑 추적 및 알림
- UTXO 연령 분포 차트
- 해시레이트 / 난이도 조정 추이
- 지표 기반 시장 사이클 판단 도구

**기술 스택 (예시)**: Python/FastAPI, PostgreSQL, Bitcoin Core RPC, React, Recharts

**난이도**: ★★★★☆

---

## 6. Nostr + Bitcoin Social App

**한줄 요약**: Nostr 프로토콜 기반의 비트코인 커뮤니티 소셜 앱

**문제 정의**
- 트위터/X 등 중앙화 플랫폼에 의존하지 않는 비트코인 커뮤니티 필요
- Nostr는 탈중앙화 소셜 프로토콜로 비트코인과 자연스럽게 연동

**핵심 기능**
- Nostr 기반 피드 (비트코인 관련 릴레이 큐레이션)
- Zap (라이트닝 네트워크 팁) 통합
- 비트코인 가격/뉴스 위젯
- NIP-05 인증
- 한국어 UI 지원

**기술 스택 (예시)**: React Native / Flutter, nostr-tools, Lightning (NWC)

**난이도**: ★★★★☆

---

## 7. Bitcoin Education Interactive Platform

**한줄 요약**: 비트코인을 단계별로 배울 수 있는 인터랙티브 교육 플랫폼

**문제 정의**
- 비트코인 학습 자료가 영어 중심이고 파편화되어 있음
- 한국어로 된 체계적이고 인터랙티브한 교육 콘텐츠 부족

**핵심 기능**
- 단계별 학습 코스 (비트코인 기초 → 기술 원리 → 노드 운영)
- 인터랙티브 시뮬레이션 (트랜잭션 생성, 채굴 과정 체험)
- SHA-256 해싱 시각화
- 퀴즈 및 진행률 추적
- testnet 기반 실습 환경

**기술 스택 (예시)**: Next.js, MDX, Canvas API, Bitcoin testnet

**난이도**: ★★★☆☆

---

## 8. Sats-denominated Expense Tracker

**한줄 요약**: 일상 지출을 사토시로 환산해서 보여주는 가계부 앱

**문제 정의**
- 비트코인 관점에서 지출의 기회비용을 인식하게 해주는 도구 부재
- "이 커피 한 잔이 미래에 몇 sats인가?" 관점 제공

**핵심 기능**
- 지출 입력 시 실시간 sats 환산
- 카테고리별 지출 분석 (sats 기준)
- "만약 이 돈으로 비트코인을 샀다면" 시뮬레이션
- 월간/연간 사토시 기회비용 리포트
- PWA로 모바일 지원

**기술 스택 (예시)**: Next.js (PWA), IndexedDB, CoinGecko API

**난이도**: ★★☆☆☆

---

## 아이디어 비교표

| 프로젝트 | 난이도 | 학습 가치 | 실용성 | 커뮤니티 임팩트 |
|---------|--------|----------|--------|---------------|
| Sat Stacking DCA Tracker | ★★ | 중 | 높음 | 중 |
| Mempool Visualizer | ★★★ | 높음 | 중 | 높음 |
| Lightning Tip Jar | ★★★ | 높음 | 높음 | 높음 |
| Node Dashboard | ★★★★ | 매우 높음 | 높음 | 중 |
| On-chain Analytics | ★★★★ | 매우 높음 | 높음 | 높음 |
| Nostr Social App | ★★★★ | 높음 | 중 | 높음 |
| Education Platform | ★★★ | 중 | 높음 | 매우 높음 |
| Sats Expense Tracker | ★★ | 중 | 높음 | 중 |

## 추천 시작 순서

1. **입문자**: Sat Stacking DCA Tracker 또는 Sats Expense Tracker → 웹 개발 기본기 + 비트코인 API 연동
2. **중급자**: Lightning Tip Jar 또는 Mempool Visualizer → 라이트닝 네트워크 / 실시간 데이터 처리
3. **고급자**: Node Dashboard 또는 On-chain Analytics → Bitcoin Core RPC, 대용량 데이터 처리

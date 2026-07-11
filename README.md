# Lemuel Invest

auto-trading(KIS 한국투자증권 API) 계좌를 **Toss 스타일로 보는 조회 전용 모바일 앱**. Expo(React Native, TS).

> ⚠️ **읽기 전용.** 주문·매매 실행 로직은 백엔드(auto-trading)에만 있고, 이 앱은 잔고/체결을 *조회*만 한다. 뷰 계층.

## 화면 (MVP)

- **총 자산 히어로** — 순자산 + 평가손익(상승 빨강 / 하락 파랑, 한국 관례)
- **요약 카드** — 예수금 · 주식 평가금액 · 총 평가금액
- **보유 종목** — 종목명 · 수량 · 평균가 · 평가금액 · 수익률
- **최근 체결** — 매수/매도 · 수량 · 가격
- 20초 자동 새로고침 + 당겨서 새로고침

## 데이터 소스

`stock.lemuel.co.kr` (auto-trading)
- `GET /api/balance` — KIS 잔고 원본 → `app/kis.ts`에서 친화적 모델로 파싱
- `GET /api/trades` — 최근 체결

## 실행

```sh
cd app && npm install
EXPO_PUBLIC_API_BASE=https://stock.lemuel.co.kr npx expo start
# 폰의 Expo Go로 QR 스캔
```

## 보안 메모

- 현재 `/api/balance`·`/api/trades`는 **무인증 공개** 상태 — 계좌 잔고가 외부에 노출됨.
  실자금 운용 시 auto-trading에 토큰 인증을 추가하고 앱도 Bearer로 호출하도록 바꿀 것.

## 로드맵

- [x] MVP: 잔고/보유/체결 Toss 스타일 조회
- [ ] 종목 상세 + 차트(시세 API 연동)
- [ ] API 인증(Bearer) — 잔고 비공개화
- [ ] 관심종목 · 실시간 시세 · 푸시(급등락 알림)
- [ ] EAS 빌드(Android APK)

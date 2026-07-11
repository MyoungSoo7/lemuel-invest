# Lemuel Invest

> auto-trading(KIS 한국투자증권 API) 계좌를 **Toss 스타일로 보는 조회 전용 모바일 앱**. Expo(React Native · TypeScript).

`Expo` · `React Native` · `TypeScript` · `KIS OpenAPI(via auto-trading)` · `K3s` · `ArgoCD`

> ⚠️ **읽기 전용.** 주문·매매 실행 로직은 백엔드(auto-trading)에만 있고, 이 앱은 잔고/보유/시세를 *조회*만 한다. 순수 뷰 계층.

---

## 왜 만들었나

이미 KIS OpenAPI 로 실매매하는 백엔드(auto-trading)가 있었지만, 화면은 밋밋한 서버렌더 대시보드 1장뿐이었다. Lemuel Invest 는 그 **기존 API 위에 Toss 스타일 모바일 UX** 만 새로 올린 프로젝트다 — "라이선스 있는 브로커 API + 홈랩 + 모바일"로 이어지는 풀스택 스토리의 마지막 조각.

## 스크린샷

> 📱 *스크린샷 자리* — Expo Go 실행 후 캡처해 `docs/` 에 추가 예정 (평일 장중이면 실시간 시세)

```
┌─────────────────────────┐
│ 내 투자                 │
│  총 자산                │
│  1,075원                │   ● 순자산 히어로 (상승 빨강/하락 파랑)
│  ▲ 0원 (+0.00%)         │
│ [예수금][주식평가][총]  │
│ 관심 종목 ───────────   │
│ 삼성전자   ▂▃▅▇  71,200 │   ● 탭 → 종목 상세(큰 차트)
│ SK하이닉스 ▇▅▃▂  ...    │
│ 보유 종목 (없음)        │
│ 최근 체결 (없음)        │
└─────────────────────────┘
```

## 화면

- **총 자산 히어로** — 순자산 + 평가손익 (상승 빨강 / 하락 파랑, 한국 관례)
- **요약** — 예수금 · 주식 평가금액 · 총 평가금액
- **관심 종목** — 4종목 + 현재가·등락률 + 미니 스파크라인 → **탭하면 종목 상세**(큰 막대 차트 + 고/저)
- **보유 종목** · **최근 체결**
- 20초 자동 새로고침 · 당겨서 새로고침

## 데이터 소스

`stock.lemuel.co.kr` (auto-trading, KIS OpenAPI 백엔드)
| 엔드포인트 | 내용 |
|---|---|
| `GET /api/balance` | KIS 잔고 원본 → `app/kis.ts` 에서 친화적 모델 파싱 |
| `GET /api/trades` | 최근 체결 |
| `GET /api/watchlist` | 감시종목 + 최근 시세·등락 |
| `GET /api/chart/{code}` | 종목별 가격 이력 (차트) |

> KIS 는 축약 필드명(`nass_amt`, `stck_prpr` …)을 쓴다. `app/kis.ts` 가 이걸 `netAsset`, `price` 같은 앱 모델로 한 번에 변환한다.

## 실행

```sh
cd app && npm install
EXPO_PUBLIC_API_BASE=https://stock.lemuel.co.kr npx expo start
# 폰의 Expo Go 로 QR 스캔
```

### EAS 로 APK 빌드 (선택)

```sh
cd app
npx eas login                              # Expo 계정
npx eas build -p android --profile preview # 클라우드 빌드 → APK 링크
```

## 참고

- 관심종목 시세는 **평일 장중(09:00~15:30)** 에 백엔드 스케줄러가 채운다. 주말/장마감엔 "장마감" 표기.
- `/api/*` 는 현재 **무인증 공개** 상태. 실자금 운용 시 도메인에 Cloudflare Access + 앱 service token 으로 잔고를 비공개화할 것.

## 로드맵

- [x] 잔고/보유/체결 Toss 스타일 조회
- [x] 관심종목 시세 + 미니 스파크라인
- [x] 종목 상세 (큰 차트)
- [x] EAS 빌드 준비 (app.json · eas.json)
- [ ] API 인증 (잔고 비공개화)
- [ ] 실시간 시세 스트리밍 · 급등락 푸시 알림
- [ ] 관심종목 앱에서 추가/삭제

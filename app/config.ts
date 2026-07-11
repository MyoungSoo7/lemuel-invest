// Lemuel Invest — auto-trading(KIS) API 를 읽는 Toss 스타일 앱
// 뷰 전용. 주문/실행 로직은 백엔드(auto-trading)에만 있고 이 앱은 조회만 한다.
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://stock.lemuel.co.kr';
export const REFRESH_INTERVAL_MS = 20_000;

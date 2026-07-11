// Lemuel Invest — auto-trading(KIS) API 를 읽는 Toss 스타일 앱
// 뷰 전용. 주문/실행 로직은 백엔드(auto-trading)에만 있고 이 앱은 조회만 한다.
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://stock.lemuel.co.kr';
export const REFRESH_INTERVAL_MS = 20_000;

// stock.lemuel.co.kr 은 Cloudflare Access 로 보호됨(페이지=이메일 로그인).
// /api 는 Access bypass + Spring 토큰 게이트 → 앱은 X-Api-Token 헤더로 통과.
// 토큰은 빌드 시 env/EAS secret 로 주입(리포에 하드코딩 X).
export const API_HEADERS: Record<string, string> = (() => {
  const h: Record<string, string> = { accept: 'application/json' };
  const token = process.env.EXPO_PUBLIC_API_TOKEN;
  if (token) h['X-Api-Token'] = token;
  return h;
})();

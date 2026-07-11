// Lemuel Invest — auto-trading(KIS) API 를 읽는 Toss 스타일 앱
// 뷰 전용. 주문/실행 로직은 백엔드(auto-trading)에만 있고 이 앱은 조회만 한다.
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://stock.lemuel.co.kr';
export const REFRESH_INTERVAL_MS = 20_000;

// stock.lemuel.co.kr 은 Cloudflare Access 로 보호됨.
// 앱은 service token 으로 통과한다 — 값은 빌드 시 env/EAS secret 로 주입(리포에 하드코딩 X).
export const CF_ACCESS_HEADERS: Record<string, string> = (() => {
  const id = process.env.EXPO_PUBLIC_CF_ACCESS_CLIENT_ID;
  const secret = process.env.EXPO_PUBLIC_CF_ACCESS_CLIENT_SECRET;
  const h: Record<string, string> = {};
  if (id && secret) {
    h['CF-Access-Client-Id'] = id;
    h['CF-Access-Client-Secret'] = secret;
  }
  return h;
})();

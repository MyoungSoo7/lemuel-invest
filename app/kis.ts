// KIS(한국투자증권) balance/trades 원본 응답을 앱이 쓰기 좋은 형태로 파싱.
// KIS 필드명은 축약형이라 여기서 한 번에 친화적 모델로 변환한다.
import { API_BASE, API_HEADERS } from './config';

export type Holding = {
  code: string;        // 종목코드
  name: string;        // 종목명
  qty: number;         // 보유수량
  avgPrice: number;    // 매입평균가
  price: number;       // 현재가
  evalAmount: number;  // 평가금액
  profit: number;      // 평가손익
  profitRate: number;  // 수익률 %
};

export type Account = {
  netAsset: number;    // 순자산
  deposit: number;     // 예수금
  totalEval: number;   // 총평가금액
  securitiesEval: number; // 유가증권 평가금액
  profit: number;      // 평가손익 합계
  profitRate: number;  // 총 수익률 %
  holdings: Holding[];
};

export type Trade = {
  name: string;
  side: string;   // 매수/매도
  qty: number;
  price: number;
  time: string;
};

export type Watch = {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  history: number[];  // 최신-우선
};

const n = (v: any) => (v == null || v === '' ? 0 : Number(v)) || 0;

export async function fetchAccount(): Promise<Account> {
  const res = await fetch(`${API_BASE}/api/balance`, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  const s = (raw.output2 && raw.output2[0]) || {};
  const holdings: Holding[] = (raw.output1 || []).map((h: any) => ({
    code: h.pdno ?? '',
    name: (h.prdt_name ?? '').trim() || h.pdno || '종목',
    qty: n(h.hldg_qty),
    avgPrice: n(h.pchs_avg_pric),
    price: n(h.prpr),
    evalAmount: n(h.evlu_amt),
    profit: n(h.evlu_pfls_amt),
    profitRate: n(h.evlu_pfls_rt),
  })).filter((h: Holding) => h.qty > 0);

  const securitiesEval = n(s.scts_evlu_amt);
  const profit = n(s.evlu_pfls_smtl_amt);
  const investBase = securitiesEval - profit; // 매입원가 근사
  return {
    netAsset: n(s.nass_amt),
    deposit: n(s.dnca_tot_amt),
    totalEval: n(s.tot_evlu_amt),
    securitiesEval,
    profit,
    profitRate: investBase > 0 ? (profit / investBase) * 100 : 0,
    holdings,
  };
}

export async function fetchWatchlist(): Promise<Watch[]> {
  try {
    const res = await fetch(`${API_BASE}/api/watchlist`, { headers: API_HEADERS });
    if (!res.ok) return [];
    const raw = await res.json();
    return (Array.isArray(raw) ? raw : []).map((w: any) => ({
      code: w.code ?? '',
      name: w.name ?? w.code ?? '종목',
      price: n(w.price),
      change: n(w.change),
      changeRate: n(w.changeRate),
      history: (w.history ?? []).map((x: any) => n(x)),
    }));
  } catch {
    return [];
  }
}

// 종목 가격 이력(차트) — /api/chart/{code}. 최신-우선 → 시간순으로 뒤집어 반환
export async function fetchChart(code: string): Promise<number[]> {
  try {
    const res = await fetch(`${API_BASE}/api/chart/${code}`, { headers: API_HEADERS });
    if (!res.ok) return [];
    const raw = await res.json();
    return (Array.isArray(raw) ? raw : []).map((x: any) => n(x)).reverse();
  } catch {
    return [];
  }
}

export async function fetchTrades(): Promise<Trade[]> {
  try {
    const res = await fetch(`${API_BASE}/api/trades`, { headers: API_HEADERS });
    if (!res.ok) return [];
    const raw = await res.json();
    const arr = Array.isArray(raw) ? raw : raw.output || [];
    return arr.map((t: any) => ({
      name: (t.prdt_name ?? t.name ?? '').trim() || '종목',
      side: t.sll_buy_dvsn_cd_name ?? t.side ?? (t.sll_buy_dvsn_cd === '02' ? '매수' : '매도'),
      qty: n(t.qty ?? t.tot_ccld_qty ?? t.ord_qty),
      price: n(t.price ?? t.avg_prvs ?? t.ord_unpr),
      time: t.time ?? t.ord_tmd ?? '',
    }));
  } catch {
    return [];
  }
}

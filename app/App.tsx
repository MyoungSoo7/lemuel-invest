// Lemuel Invest — Toss 스타일 투자 대시보드 (읽기전용 · auto-trading KIS API)
import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { API_BASE, REFRESH_INTERVAL_MS } from './config';
import { Account, fetchAccount, fetchTrades, fetchWatchlist, Holding, Trade, Watch } from './kis';

// 한국 관례: 상승/이익 = 빨강, 하락/손실 = 파랑
const RED = '#f04452';   // Toss red
const BLUE = '#3182f6';  // Toss blue
const INK = '#191f28';
const GRAY = '#8b95a1';

const won = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`;
const pct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
const pl = (v: number) => (v > 0 ? RED : v < 0 ? BLUE : GRAY);

export default function App() {
  const [acc, setAcc] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [watch, setWatch] = useState<Watch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, t, w] = await Promise.all([fetchAccount(), fetchTrades(), fetchWatchlist()]);
      setAcc(a); setTrades(t); setWatch(w); setError(null);
    } catch (e: any) {
      setError(String(e.message ?? e));
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(t);
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} />}
      >
        <Text style={s.brand}>내 투자</Text>

        {error && <View style={s.errBox}><Text style={s.errText}>연결 실패: {error}</Text></View>}

        {acc && (
          <>
            {/* 순자산 히어로 */}
            <View style={s.hero}>
              <Text style={s.heroLabel}>총 자산</Text>
              <Text style={s.heroValue}>{won(acc.netAsset)}</Text>
              <View style={s.heroPl}>
                <Text style={[s.heroPlText, { color: pl(acc.profit) }]}>
                  {acc.profit >= 0 ? '▲' : '▼'} {won(Math.abs(acc.profit))} ({pct(acc.profitRate)})
                </Text>
              </View>
            </View>

            {/* 요약 카드 */}
            <View style={s.card}>
              <Row k="예수금" v={won(acc.deposit)} />
              <Divider />
              <Row k="주식 평가금액" v={won(acc.securitiesEval)} />
              <Divider />
              <Row k="총 평가금액" v={won(acc.totalEval)} strong />
            </View>

            {/* 관심 종목 */}
            {watch.length > 0 && (
              <>
                <Text style={s.sectionTitle}>관심 종목</Text>
                <View style={s.card}>
                  {watch.map((w) => <WatchRow key={w.code} w={w} />)}
                </View>
              </>
            )}

            {/* 보유 종목 */}
            <Text style={s.sectionTitle}>보유 종목 {acc.holdings.length > 0 ? `${acc.holdings.length}` : ''}</Text>
            <View style={s.card}>
              {acc.holdings.length === 0 && <Text style={s.empty}>보유 중인 종목이 없어요</Text>}
              {acc.holdings.map((h) => <HoldingRow key={h.code} h={h} />)}
            </View>

            {/* 최근 체결 */}
            <Text style={s.sectionTitle}>최근 체결</Text>
            <View style={s.card}>
              {trades.length === 0 && <Text style={s.empty}>최근 체결 내역이 없어요</Text>}
              {trades.slice(0, 20).map((t, i) => <TradeRow key={i} t={t} />)}
            </View>

            <Text style={s.footer}>20초마다 자동 새로고침 · 조회 전용</Text>
          </>
        )}

        {!acc && !error && <Text style={s.footer}>불러오는 중…</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={s.rowK}>{k}</Text>
      <Text style={[s.rowV, strong && { fontWeight: '700', color: INK }]}>{v}</Text>
    </View>
  );
}

function HoldingRow({ h }: { h: Holding }) {
  return (
    <View style={s.hRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.hName} numberOfLines={1}>{h.name}</Text>
        <Text style={s.hSub}>{h.qty.toLocaleString('ko-KR')}주 · 평균 {won(h.avgPrice)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={s.hAmt}>{won(h.evalAmount)}</Text>
        <Text style={[s.hPl, { color: pl(h.profit) }]}>{pct(h.profitRate)} · {won(h.profit)}</Text>
      </View>
    </View>
  );
}

// 미니 스파크라인 — react-native-svg 없이 작은 세로 막대로 추세 표현
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.slice(0, 20).reverse().filter((v) => v > 0); // 최신-우선 → 시간순
  if (pts.length < 2) return <View style={{ width: 64 }} />;
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  return (
    <View style={s.spark}>
      {pts.map((v, i) => (
        <View key={i} style={{
          flex: 1,
          height: 6 + ((v - min) / range) * 22,
          backgroundColor: color,
          opacity: 0.25 + (i / pts.length) * 0.75,
          marginHorizontal: 0.5,
          borderRadius: 1,
        }} />
      ))}
    </View>
  );
}

function WatchRow({ w }: { w: Watch }) {
  const c = pl(w.change);
  return (
    <View style={s.hRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.hName} numberOfLines={1}>{w.name}</Text>
        <Text style={s.hSub}>{w.code}</Text>
      </View>
      <Sparkline data={w.history} color={c} />
      <View style={{ alignItems: 'flex-end', minWidth: 88 }}>
        <Text style={s.hAmt}>{w.price > 0 ? won(w.price) : '—'}</Text>
        <Text style={[s.hPl, { color: c }]}>{w.price > 0 ? pct(w.changeRate) : '장마감'}</Text>
      </View>
    </View>
  );
}

function TradeRow({ t }: { t: Trade }) {
  const buy = /매수|02|BUY/i.test(t.side);
  return (
    <View style={s.hRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.hName} numberOfLines={1}>{t.name}</Text>
        <Text style={s.hSub}>{t.time}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[s.tSide, { color: buy ? RED : BLUE }]}>{buy ? '매수' : '매도'} {t.qty.toLocaleString('ko-KR')}주</Text>
        <Text style={s.hSub}>{won(t.price)}</Text>
      </View>
    </View>
  );
}

const Divider = () => <View style={s.divider} />;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f4f6' },
  scroll: { padding: 16, paddingBottom: 60 },
  brand: { fontSize: 22, fontWeight: '800', color: INK, marginVertical: 10 },
  errBox: { backgroundColor: '#fff0f0', borderRadius: 12, padding: 14, marginBottom: 12 },
  errText: { color: RED, fontSize: 13 },
  hero: { backgroundColor: '#fff', borderRadius: 20, padding: 22, marginBottom: 14 },
  heroLabel: { color: GRAY, fontSize: 14, marginBottom: 6 },
  heroValue: { color: INK, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  heroPl: { marginTop: 8 },
  heroPlText: { fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 6, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 14 },
  rowK: { color: GRAY, fontSize: 15 },
  rowV: { color: INK, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f2f4f6', marginHorizontal: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: INK, marginBottom: 8, marginLeft: 4 },
  hRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, gap: 10 },
  hName: { color: INK, fontSize: 15, fontWeight: '600' },
  hSub: { color: GRAY, fontSize: 12, marginTop: 3 },
  hAmt: { color: INK, fontSize: 15, fontWeight: '600' },
  hPl: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  tSide: { fontSize: 14, fontWeight: '600' },
  spark: { flexDirection: 'row', alignItems: 'flex-end', width: 64, height: 28 },
  empty: { color: GRAY, fontSize: 14, padding: 16, textAlign: 'center' },
  footer: { color: GRAY, fontSize: 12, textAlign: 'center', marginTop: 8 },
});

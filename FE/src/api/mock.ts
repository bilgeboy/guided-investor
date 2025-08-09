// FE/src/api/mock.ts
export async function mockBacktestRun(payload: any) {
  // הדמיה: 800ms ואז מחזירים תוצאה
  await new Promise((r) => setTimeout(r, 800));
  return {
    ok: true,
    payload,
    summary: {
      totalTrades: 42,
      winRate: 0.57,
      avgPnL: 1.8,
      maxDrawdown: -6.4,
    },
  };
}

export async function mockBeginnerCreateAccount(broker: string) {
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, broker, note: "חשבון נוצר בהצלחה (דמו)!" };
}

export async function mockPlaceFirstTrade({
  symbol,
  amount,
}: {
  symbol: string;
  amount: number;
}) {
  await new Promise((r) => setTimeout(r, 700));
  return { ok: true, symbol, amount, priceFilled: 123.45 };
}

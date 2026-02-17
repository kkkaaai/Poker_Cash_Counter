import { PlayerSummary, Transfer } from "./types";

export function calculateSettlements(players: PlayerSummary[]): Transfer[] {
  const balances: { name: string; net: number }[] = [];

  for (const p of players) {
    if (p.cashout === null) continue;
    balances.push({ name: p.name, net: p.cashout - p.totalBuyIn });
  }

  const losers: { name: string; amount: number }[] = [];
  const winners: { name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.net < 0) losers.push({ name: b.name, amount: Math.abs(b.net) });
    else if (b.net > 0) winners.push({ name: b.name, amount: b.net });
  }

  losers.sort((a, b) => b.amount - a.amount);
  winners.sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < losers.length && j < winners.length) {
    const transferAmount = Math.min(losers[i].amount, winners[j].amount);
    transfers.push({
      from: losers[i].name,
      to: winners[j].name,
      amount: transferAmount,
    });

    losers[i].amount -= transferAmount;
    winners[j].amount -= transferAmount;

    if (losers[i].amount === 0) i++;
    if (winners[j].amount === 0) j++;
  }

  return transfers;
}

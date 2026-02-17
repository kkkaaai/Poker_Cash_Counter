import { Player, Transaction, PlayerSummary } from "./types";

export function buildPlayerSummaries(
  players: Player[],
  transactions: Transaction[]
): PlayerSummary[] {
  return players.map((player) => {
    const playerTx = transactions.filter((t) => t.player_id === player.id);
    const totalBuyIn = playerTx
      .filter((t) => t.status === "confirmed")
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingBuyIn = playerTx
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);
    const net = player.cashout !== null ? player.cashout - totalBuyIn : null;

    return {
      id: player.id,
      name: player.name,
      totalBuyIn,
      pendingBuyIn,
      cashout: player.cashout,
      net,
    };
  });
}

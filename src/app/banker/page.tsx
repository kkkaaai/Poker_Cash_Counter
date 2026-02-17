"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Player, TransactionWithPlayer } from "@/lib/types";
import { buildPlayerSummaries } from "@/lib/playerSummary";
import { formatNet } from "@/lib/format";
import PendingRequest from "@/components/PendingRequest";

export default function BankerPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithPlayer[]>([]);
  const [endGameError, setEndGameError] = useState("");

  const fetchData = useCallback(async () => {
    const [playersRes, txRes] = await Promise.all([
      supabase.from("players").select("*").order("created_at"),
      supabase.from("transactions").select("*, players(name)").order("created_at"),
    ]);
    if (playersRes.data) setPlayers(playersRes.data);
    if (txRes.data) setTransactions(txRes.data as TransactionWithPlayer[]);
  }, []);

  useEffect(() => {
    fetchData();

    const playerSub = supabase
      .channel("banker-players")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => fetchData())
      .subscribe();

    const txSub = supabase
      .channel("banker-transactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(playerSub);
      supabase.removeChannel(txSub);
    };
  }, [fetchData]);

  const pendingTx = transactions.filter((t) => t.status === "pending");
  const summaries = buildPlayerSummaries(players, transactions);
  const totalInPlay = summaries.reduce((sum, p) => sum + p.totalBuyIn, 0);
  const allCashedOut = players.length > 0 && players.every((p) => p.cashout !== null);
  const canEndGame = allCashedOut && pendingTx.length === 0;

  function handleEndGame() {
    if (!allCashedOut) {
      setEndGameError("All players must cash out before ending the game.");
      return;
    }
    if (pendingTx.length > 0) {
      setEndGameError("There are still pending buy-in requests. Please confirm or reject them first.");
      return;
    }
    router.push("/settlement");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/" className="text-gray-500 text-sm py-2 pr-4 -ml-2 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">&larr; Back</Link>
        <h1 className="font-bold text-lg">Banker</h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Stats Bar */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between text-sm max-w-2xl mx-auto w-full">
          <div>
            <span className="text-gray-500">Players: </span>
            <span className="font-bold">{players.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Total in play: </span>
            <span className="font-bold text-emerald-600">£{totalInPlay}</span>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingTx.length > 0 && (
          <div className="px-4 pt-4 max-w-2xl mx-auto w-full">
            <h2 className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-2">
              Pending Requests ({pendingTx.length})
            </h2>
            <div className="space-y-2">
              {pendingTx.map((tx) => (
                <PendingRequest
                  key={tx.id}
                  id={tx.id}
                  playerName={tx.players.name}
                  amount={tx.amount}
                  onSuccess={fetchData}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Players */}
        <div className="px-4 pt-4 pb-2 max-w-2xl mx-auto w-full">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            All Players
          </h2>
          {summaries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Waiting for players to join...</p>
          ) : (
            <div className="space-y-2">
              {summaries.map((p) => (
                <div key={p.id} className="p-4 bg-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{p.name}</div>
                    {p.cashout !== null ? (
                      <span className={`font-bold ${p.net! >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {formatNet(p.net!)}
                      </span>
                    ) : (
                      <span className="text-gray-500">Playing</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Buy-in: £{p.totalBuyIn}
                    {p.pendingBuyIn > 0 && (
                      <span className="text-yellow-600"> (+£{p.pendingBuyIn} pending)</span>
                    )}
                    {p.cashout !== null && (
                      <span> | Cash-out: £{p.cashout}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* End Game Button */}
      <div className="px-4 py-4 border-t border-gray-200 max-w-2xl mx-auto w-full">
        {endGameError && (
          <p className="text-red-500 text-sm text-center mb-3">{endGameError}</p>
        )}
        {!canEndGame && players.length > 0 && !endGameError && (
          <p className="text-gray-400 text-xs text-center mb-3">Cash out all players to end the game</p>
        )}
        <button
          onClick={handleEndGame}
          className={`w-full h-14 rounded-xl text-lg font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-red-500 ${
            canEndGame
              ? "bg-red-600 text-white active:bg-red-700"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          End Game
        </button>
      </div>
    </div>
  );
}

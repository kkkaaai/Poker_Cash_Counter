"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Player, Transaction, PlayerSummary, Transfer } from "@/lib/types";
import { buildPlayerSummaries } from "@/lib/playerSummary";
import { formatNet } from "@/lib/format";
import { NIL_UUID } from "@/lib/constants";
import { calculateSettlements } from "@/lib/settlement";
import SettlementList from "@/components/SettlementList";

export default function SettlementPage() {
  const router = useRouter();
  const [summaries, setSummaries] = useState<PlayerSummary[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingNewGame, setConfirmingNewGame] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    async function fetchAndCalculate() {
      const [playersRes, txRes] = await Promise.all([
        supabase.from("players").select("*").order("created_at"),
        supabase.from("transactions").select("*").eq("status", "confirmed"),
      ]);

      const players: Player[] = playersRes.data || [];
      const transactions: Transaction[] = txRes.data || [];
      const playerSummaries = buildPlayerSummaries(players, transactions);

      setSummaries(playerSummaries);
      setTransfers(calculateSettlements(playerSummaries));
      setLoading(false);
    }

    fetchAndCalculate();
  }, []);

  async function handleNewGame() {
    setResetError("");
    const { error: txError } = await supabase.from("transactions").delete().neq("id", NIL_UUID);
    if (txError) {
      setResetError("Failed to reset game. Please try again.");
      return;
    }
    const { error: playerError } = await supabase.from("players").delete().neq("id", NIL_UUID);
    if (playerError) {
      setResetError("Failed to reset game. Please try again.");
      return;
    }
    router.push("/");
  }

  const cashedOutPlayers = summaries
    .filter((p) => p.cashout !== null)
    .sort((a, b) => (b.net || 0) - (a.net || 0));

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-gray-400">Calculating settlements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <Link href="/banker" className="text-gray-400 text-sm py-2 pr-4 -ml-2 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">&larr; Back</Link>
        <h1 className="font-bold text-lg">Settlement</h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Player Results */}
        <div className="px-4 pt-4 max-w-2xl mx-auto w-full">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Results
          </h2>
          {cashedOutPlayers.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No results to show.</p>
          ) : (
            <div className="space-y-2">
              {cashedOutPlayers.map((p) => (
                <div key={p.id} className="p-4 bg-gray-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-400">
                      In: £{p.totalBuyIn} | Out: £{p.cashout}
                    </div>
                  </div>
                  <div className={`font-bold text-xl ${p.net! >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatNet(p.net!)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transfers */}
        <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto w-full">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Who Pays Who
          </h2>
          <SettlementList transfers={transfers} />
        </div>
      </div>

      {/* New Game Button */}
      <div className="px-4 py-4 border-t border-gray-800 max-w-2xl mx-auto w-full">
        {resetError && <p className="text-red-400 text-sm text-center mb-3">{resetError}</p>}
        {confirmingNewGame ? (
          <div className="space-y-3">
            <p className="text-center text-gray-300 text-sm">Start a new game? This will clear all current data.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingNewGame(false)}
                className="flex-1 h-14 rounded-xl bg-gray-700 text-lg font-semibold active:bg-gray-600 focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleNewGame}
                className="flex-1 h-14 rounded-xl bg-red-600 text-lg font-semibold active:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingNewGame(true)}
            className="w-full h-14 rounded-xl bg-emerald-600 text-lg font-semibold active:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            New Game
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Player, Transaction, PlayerSummary } from "@/lib/types";
import { buildPlayerSummaries } from "@/lib/playerSummary";
import { useEscapeKey } from "@/lib/useEscapeKey";
import PlayerCard from "@/components/PlayerCard";
import BuyInModal from "@/components/BuyInModal";
import CashOutModal from "@/components/CashOutModal";

export default function PlayerPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(null);
  const [modal, setModal] = useState<"buyin" | "cashout" | "choose" | null>(null);

  const fetchData = useCallback(async () => {
    const [playersRes, txRes] = await Promise.all([
      supabase.from("players").select("*").order("created_at"),
      supabase.from("transactions").select("*"),
    ]);
    if (playersRes.data) setPlayers(playersRes.data);
    if (txRes.data) setTransactions(txRes.data);
  }, []);

  useEffect(() => {
    fetchData();

    const playerSub = supabase
      .channel("players-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => fetchData())
      .subscribe();

    const txSub = supabase
      .channel("transactions-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(playerSub);
      supabase.removeChannel(txSub);
    };
  }, [fetchData]);

  const closeModal = useCallback(() => setModal(null), []);
  useEscapeKey(closeModal);

  async function handleJoin() {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 30) return;

    setError("");
    setJoining(true);
    const { error: insertError } = await supabase.from("players").insert({ name: trimmed });
    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "Name already taken!" : "Something went wrong. Try again.");
    } else {
      setName("");
      fetchData();
    }
    setJoining(false);
  }

  function handleSelectPlayer(player: PlayerSummary) {
    setSelectedPlayer(player);
    setModal("choose");
  }

  const summaries = buildPlayerSummaries(players, transactions);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <Link href="/" className="text-gray-400 text-sm py-2 pr-4 -ml-2 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">&larr; Back</Link>
        <h1 className="font-bold text-lg">Players</h1>
        <div className="w-12" />
      </header>

      {/* Join Form */}
      <div className="px-4 pt-4 pb-2 w-full max-w-2xl mx-auto">
        <label htmlFor="player-name" className="sr-only">Your name</label>
        <div className="flex gap-2">
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Enter your name"
            maxLength={30}
            className="flex-1 h-12 bg-gray-800 rounded-xl px-4 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleJoin}
            disabled={joining || !name.trim()}
            className="h-12 px-5 rounded-xl bg-emerald-600 font-medium disabled:opacity-40 active:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {joining ? "Joining..." : "Join"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Player List */}
      <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto w-full max-w-2xl mx-auto">
        {summaries.length === 0 ? (
          <p className="text-center text-gray-400 mt-8">No players yet. Join the game!</p>
        ) : (
          summaries.map((p) => (
            <PlayerCard key={p.id} player={p} onSelect={handleSelectPlayer} />
          ))
        )}
      </div>

      {/* Choose Action Modal */}
      {modal === "choose" && selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={() => setModal(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="choose-action-title"
            className="bg-gray-900 rounded-t-3xl w-full max-w-md p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="choose-action-title" className="text-xl font-bold mb-4">{selectedPlayer.name}</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setModal("buyin")}
                className="h-14 rounded-xl bg-emerald-600 text-lg font-semibold active:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Buy In
              </button>
              <button
                onClick={() => setModal("cashout")}
                className="h-14 rounded-xl bg-blue-600 text-lg font-semibold active:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Cash Out
              </button>
              <button
                onClick={() => setModal(null)}
                className="h-14 rounded-xl bg-gray-800 text-lg font-medium text-gray-300 active:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy In Modal */}
      {modal === "buyin" && selectedPlayer && (
        <BuyInModal
          playerId={selectedPlayer.id}
          playerName={selectedPlayer.name}
          onClose={() => setModal(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Cash Out Modal */}
      {modal === "cashout" && selectedPlayer && (
        <CashOutModal
          playerId={selectedPlayer.id}
          playerName={selectedPlayer.name}
          totalBuyIn={selectedPlayer.totalBuyIn}
          onClose={() => setModal(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

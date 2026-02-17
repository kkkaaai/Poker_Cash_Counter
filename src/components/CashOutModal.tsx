"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEscapeKey } from "@/lib/useEscapeKey";
import { formatNet } from "@/lib/format";

interface CashOutModalProps {
  playerId: string;
  playerName: string;
  totalBuyIn: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CashOutModal({ playerId, playerName, totalBuyIn, onClose, onSuccess }: CashOutModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEscapeKey(onClose);

  const cashoutValue = parseInt(amount) || 0;
  const net = cashoutValue - totalBuyIn;

  async function handleSubmit() {
    // A cash-out of 0 is valid (player lost all chips)
    if (cashoutValue < 0) return;

    setError("");
    setLoading(true);
    const { error: updateError } = await supabase
      .from("players")
      .update({ cashout: cashoutValue })
      .eq("id", playerId);

    if (updateError) {
      setError("Failed to save cash-out. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cashout-title"
        className="bg-gray-900 rounded-t-3xl w-full max-w-md p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cashout-title" className="text-xl font-bold mb-1">Cash Out</h2>
        <p className="text-gray-400 text-sm mb-4">{playerName} — Total buy-in: £{totalBuyIn}</p>

        <label htmlFor="cashout-amount" className="text-sm text-gray-400 mb-1 block">Chip Count</label>
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">£</span>
          <input
            id="cashout-amount"
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="0"
            autoFocus
            className="w-full h-14 bg-gray-800 rounded-xl pl-10 pr-4 text-2xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {amount && (
          <div className={`text-center text-lg font-bold mb-4 ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatNet(net)}
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-gray-800 text-gray-300 font-medium active:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || amount === ""}
            className="flex-1 h-12 rounded-xl bg-blue-600 font-medium disabled:opacity-40 active:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {loading ? "Saving..." : "Confirm Cash Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

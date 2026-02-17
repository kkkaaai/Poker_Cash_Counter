"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEscapeKey } from "@/lib/useEscapeKey";
import { MAX_BUY_IN } from "@/lib/constants";

interface BuyInModalProps {
  playerId: string;
  playerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyInModal({ playerId, playerName, onClose, onSuccess }: BuyInModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEscapeKey(onClose);

  const parsedAmount = Math.round(Number(amount));
  const isValidAmount = parsedAmount > 0 && parsedAmount <= MAX_BUY_IN;

  async function handleSubmit() {
    if (!isValidAmount) return;

    setError("");
    setLoading(true);
    const { error: insertError } = await supabase.from("transactions").insert({
      player_id: playerId,
      amount: parsedAmount,
      status: "pending",
    });

    if (insertError) {
      setError("Failed to submit buy-in. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="buyin-title"
        className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="buyin-title" className="text-xl font-bold mb-1">Buy In</h2>
        <p className="text-gray-500 text-sm mb-6">{playerName}</p>

        <label htmlFor="buyin-amount" className="text-sm text-gray-500 mb-1 block">Amount</label>
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">£</span>
          <input
            id="buyin-amount"
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="0"
            autoFocus
            className="w-full h-14 bg-gray-100 rounded-xl pl-10 pr-4 text-2xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-600 font-medium active:bg-gray-200 focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValidAmount}
            className="flex-1 h-12 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-40 active:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {loading ? "Sending..." : "Request Buy In"}
          </button>
        </div>
      </div>
    </div>
  );
}

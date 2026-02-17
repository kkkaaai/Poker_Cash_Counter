"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface PendingRequestProps {
  id: string;
  playerName: string;
  amount: number;
  onSuccess: () => void;
}

export default function PendingRequest({ id, playerName, amount, onSuccess }: PendingRequestProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setError("");
    setLoading(true);
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status: "confirmed" })
      .eq("id", id);
    if (updateError) { setError("Failed to confirm."); }
    else { onSuccess(); }
    setLoading(false);
  }

  async function handleReject() {
    setError("");
    setLoading(true);
    const { error: deleteError } = await supabase.from("transactions").delete().eq("id", id);
    if (deleteError) { setError("Failed to reject."); }
    else { onSuccess(); }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <div>
        <div className="font-semibold">{playerName}</div>
        <div className="text-yellow-600 font-bold">£{amount}</div>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={loading}
          className="h-10 px-4 rounded-lg bg-gray-200 text-sm font-medium active:bg-gray-300 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          Reject
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          aria-label={loading ? "Processing" : "Confirm buy-in"}
          className="h-10 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium active:bg-emerald-700 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {loading ? "..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}

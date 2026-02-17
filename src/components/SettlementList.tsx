"use client";

import { Transfer } from "@/lib/types";

interface SettlementListProps {
  transfers: Transfer[];
}

export default function SettlementList({ transfers }: SettlementListProps) {
  if (transfers.length === 0) {
    return <p className="text-center text-gray-400 py-4">No transfers needed — everyone broke even!</p>;
  }

  return (
    <div className="space-y-3">
      {transfers.map((t) => (
        <div key={`${t.from}-${t.to}`} className="p-4 bg-gray-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-red-500">{t.from}</span>
            <span className="text-gray-400">&rarr;</span>
            <span className="font-semibold text-emerald-600">{t.to}</span>
          </div>
          <div className="font-bold text-lg">£{t.amount}</div>
        </div>
      ))}
    </div>
  );
}

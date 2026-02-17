"use client";

import { PlayerSummary } from "@/lib/types";
import { formatNet } from "@/lib/format";

interface PlayerCardProps {
  player: PlayerSummary;
  onSelect: (player: PlayerSummary) => void;
}

export default function PlayerCard({ player, onSelect }: PlayerCardProps) {
  const hasCashedOut = player.cashout !== null;

  return (
    <button
      onClick={() => onSelect(player)}
      disabled={hasCashedOut}
      className={`w-full text-left p-4 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        hasCashedOut
          ? "bg-gray-800/50 opacity-60"
          : "bg-gray-800 active:bg-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-lg">{player.name}</div>
          <div className="text-sm text-gray-400 mt-0.5">
            Buy-in: £{player.totalBuyIn}
            {player.pendingBuyIn > 0 && (
              <span className="text-yellow-400"> (+£{player.pendingBuyIn} pending)</span>
            )}
          </div>
        </div>
        <div className="text-right">
          {hasCashedOut ? (
            <div>
              <div className="text-sm text-gray-400">Cashed out</div>
              <div className={`font-bold ${player.net! >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatNet(player.net!)}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-2xl">&rsaquo;</div>
          )}
        </div>
      </div>
    </button>
  );
}

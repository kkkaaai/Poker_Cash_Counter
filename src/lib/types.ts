export interface Player {
  id: string;
  name: string;
  cashout: number | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  player_id: string;
  amount: number;
  status: "pending" | "confirmed";
  created_at: string;
}

export interface TransactionWithPlayer extends Transaction {
  players: { name: string };
}

export interface GameSession {
  id: string;
  status: "active" | "settled";
  created_at: string;
}

export interface PlayerSummary {
  id: string;
  name: string;
  totalBuyIn: number;
  pendingBuyIn: number;
  cashout: number | null;
  net: number | null;
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Poker Tracker</h1>
        <p className="text-gray-500 mt-2">Track your game night</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/player"
          className="flex items-center justify-center h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Player
        </Link>
        <Link
          href="/banker"
          className="flex items-center justify-center h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Banker
        </Link>
      </div>
    </div>
  );
}

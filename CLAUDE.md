# Poker Cash Counter

## What This Is

A real-time poker game night tracker built with **Next.js 16 + React 19 + Supabase + Tailwind CSS 4**. It tracks player buy-ins, cash-outs, and automatically calculates who owes whom at the end of a session.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, dark theme (gray-950 base)
- **Backend**: Supabase (Postgres + Realtime subscriptions)
- **Language**: TypeScript 5

## Project Structure

```
src/
  app/
    page.tsx              # Home - Player/Banker role selection
    layout.tsx            # Root layout with Geist font
    globals.css           # Tailwind imports
    player/page.tsx       # Player view - join, buy-in, cash-out
    banker/page.tsx       # Banker view - approve requests, manage game
    settlement/page.tsx   # End-of-game settlement calculations
  components/
    PlayerCard.tsx        # Clickable player card (disabled after cash-out)
    BuyInModal.tsx        # Bottom sheet modal for buy-in requests
    CashOutModal.tsx      # Bottom sheet modal for cash-out entry
    PendingRequest.tsx    # Banker approval/rejection card
    SettlementList.tsx    # Transfer list (who pays whom)
  lib/
    supabase.ts           # Supabase client initialization
    types.ts              # TypeScript interfaces (Player, Transaction, etc.)
    playerSummary.ts      # Shared utility: compute player summaries from raw data
    settlement.ts         # Greedy algorithm for minimal settlement transfers
    format.ts             # formatNet() helper for +/- currency display
    constants.ts          # NIL_UUID, MAX_BUY_IN constants
    useEscapeKey.ts       # Shared hook: dismiss on Escape key
supabase/
  schema.sql              # Database schema (run in Supabase SQL Editor)
```

## Database Schema (Supabase)

Three tables - run `supabase/schema.sql` in the Supabase SQL Editor:

- **players**: id (uuid), name (text, unique), cashout (int, nullable), created_at
- **transactions**: id (uuid), player_id (fk), amount (int), status ('pending'|'confirmed'), created_at
- **game_session**: id (uuid), status ('active'|'settled'), created_at

RLS is enabled with permissive policies (no auth). Realtime is enabled on `players` and `transactions`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Set these in `.env.local` (gitignored). Get them from Supabase Dashboard > Project Settings > API.

## App Workflow

1. **Home** (`/`): Choose Player or Banker role
2. **Player** (`/player`): Join game with name, request buy-ins, cash out with chip count
3. **Banker** (`/banker`): See all players + pending requests, approve/reject buy-ins, end game when all cashed out
4. **Settlement** (`/settlement`): View results sorted by P&L, see minimal transfer list, start new game

## Key Design Decisions

- **Two roles, no auth**: Player and Banker are just different views. No login required - designed for trusted game night use.
- **Pending buy-ins**: Buy-in requests go to "pending" status and require banker confirmation. This prevents unauthorized chip additions.
- **Dual update strategy**: UI updates via both Supabase realtime subscriptions (for cross-device sync) AND explicit `fetchData()` calls after local mutations (for instant feedback).
- **Settlement algorithm**: Greedy two-pointer approach that minimizes the number of transfers. Sorts losers/winners by amount, matches largest debts with largest credits.
- **Mobile-first**: Bottom sheet modals, `min-h-dvh`, touch-friendly button sizes (h-12/h-14). Desktop gets `max-w-2xl` centered containers.
- **Semantic colors**: Emerald = player/positive, Blue = banker/cash-out, Yellow = pending, Red = loss/destructive.

## Accessibility

- All modals have `role="dialog"`, `aria-modal`, `aria-labelledby`
- Form inputs have associated labels (visible or `sr-only`)
- All interactive elements have `focus-visible:ring-2` styles
- Back links have expanded touch targets (`py-2 pr-4`)
- No `userScalable: false` - pinch zoom is allowed
- No `alert()`/`confirm()` - all feedback is inline UI

## Commands

```bash
npm run dev    # Start dev server (Turbopack)
npm run build  # Production build
npm run start  # Start production server
npm run lint   # ESLint
```

## Common Tasks

### Adding a new field to players
1. Add column in `supabase/schema.sql`
2. Run ALTER TABLE in Supabase SQL Editor
3. Update `Player` interface in `src/lib/types.ts`
4. Update `buildPlayerSummaries()` in `src/lib/playerSummary.ts` if it affects summaries

### Modifying settlement logic
Edit `src/lib/settlement.ts` - pure function, easy to test in isolation.

### Changing currency symbol
Search for `£` across the codebase. The `formatNet()` helper in `src/lib/format.ts` uses `\u00a3` (pound sign).

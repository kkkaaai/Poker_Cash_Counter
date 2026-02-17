// Supabase requires a WHERE clause on .delete(). Using a nil UUID that will
// never match a real row to effectively delete all rows.
export const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export const MAX_BUY_IN = 100_000;

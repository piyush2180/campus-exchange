// Runs every migration in PGlite (real Postgres compiled to WASM) with Supabase stand-ins,
// then exercises RLS, grants and the economy functions as signed-in users.
// Usage: npm run test:db
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const ROOT = fileURLToPath(new URL("../supabase/migrations", import.meta.url));
const db = new PGlite();
let failures = 0;
const ok = (cond: unknown, msg: string) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) failures++;
};

await db.exec(`
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
  CREATE SCHEMA auth; CREATE SCHEMA extensions;
  CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT, raw_user_meta_data JSONB);
  CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS
    $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID $$;
  CREATE PUBLICATION supabase_realtime;
  GRANT USAGE ON SCHEMA public, auth, extensions TO anon, authenticated;
  GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
  -- Supabase grants everything on new public objects to these roles; RLS and REVOKEs do the rest
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
`);

for (const f of readdirSync(ROOT).sort()) {
  await db.exec(readFileSync(join(ROOT, f), "utf8"));
  console.log(`applied ${f}`);
}

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
await db.exec(`INSERT INTO auth.users VALUES ('${A}', 'a@x.com', '{"display_name":"Alice"}'), ('${B}', 'b@x.com', '{}');
               UPDATE public.profiles SET coins = 1000 WHERE id = '${A}';`);

const as = async (uid: string) =>
  db.exec(
    `RESET ROLE; SELECT set_config('request.jwt.claim.sub', '${uid}', false); SET ROLE authenticated;`,
  );
const q = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) =>
  (await db.query<T>(sql, params)).rows;
const fails = async (sql: string, params: unknown[] = []) => {
  try {
    await db.query(sql, params);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
};
const coins = async (uid: string) =>
  Number((await q<{ coins: string }>(`SELECT coins FROM profiles WHERE id = $1`, [uid]))[0].coins);

ok(
  (await q(`SELECT display_name FROM profiles WHERE id = $1`, [A]))[0].display_name === "Alice",
  "signup trigger creates profile",
);

// ── Direct writes are blocked ──
await as(A);
ok(
  /permission denied/.test(
    (await fails(`UPDATE profiles SET coins = 999999 WHERE id = '${A}'`)) ?? "",
  ),
  "cannot set own coins",
);
ok(
  (await fails(`UPDATE profiles SET display_name = 'Al' WHERE id = '${A}'`)) === null,
  "can still rename self",
);
ok(
  /permission denied/.test(
    (await fails(`INSERT INTO holdings (user_id, asset_id, shares) VALUES ('${A}', 'code', 99)`)) ??
      "",
  ),
  "cannot insert holdings",
);
ok(
  /permission denied/.test(
    (await fails(
      `INSERT INTO asset_movements (user_id, asset_id, movement_type, shares, price, coins_delta, shares_after) VALUES ('${A}','code','buy',1,1,-1,1)`,
    )) ?? "",
  ),
  "cannot forge movement logs",
);
ok(
  /permission denied/.test((await fails(`UPDATE bets SET status = 'won'`)) ?? ""),
  "cannot settle bets directly",
);
ok(
  /permission denied|row-level security/.test(
    (await fails(
      `INSERT INTO notifications (user_id, kind, title, body) VALUES ('${A}','trade','x','y')`,
    )) ?? "",
  ),
  "cannot forge notifications",
);
ok(
  /permission denied/.test((await fails(`UPDATE market_assets SET price = 1`)) ?? ""),
  "cannot move prices",
);

// ── Trades ──
const codePrice = Number(
  (await q<{ price: string }>(`SELECT price FROM market_assets WHERE id = 'code'`))[0].price,
);
const buy = (
  await q<{ r: { coins: number; shares_after: number } }>(
    `SELECT trade_asset('code', 'buy', 2) AS r`,
  )
)[0].r;
ok(
  Math.abs(buy.coins - (1000 - codePrice * 2)) < 1e-9 && buy.shares_after === 2,
  `buy 2 CODE @ ${codePrice} debits coins`,
);
ok(
  (await q(`SELECT shares FROM holdings WHERE user_id = $1 AND asset_id = 'code'`, [A]))[0]
    ?.shares == 2,
  "holding created",
);
ok(
  (await q(`SELECT 1 FROM asset_movements WHERE user_id = $1`, [A])).length === 1,
  "movement logged",
);
ok(
  (await q(`SELECT title FROM notifications WHERE user_id = $1 AND kind = 'trade'`, [A]))[0]
    ?.title === "Bought 2 CODE",
  "trade notification written",
);
ok(
  /Not enough coins/.test((await fails(`SELECT trade_asset('code', 'buy', 1000)`)) ?? ""),
  "cannot overspend",
);
ok(
  /Not enough shares/.test((await fails(`SELECT trade_asset('code', 'sell', 3)`)) ?? ""),
  "cannot oversell",
);
await q(`SELECT trade_asset('code', 'sell', 2)`);
ok(
  (await q(`SELECT 1 FROM holdings WHERE user_id = $1`, [A])).length === 0 &&
    (await coins(A)) === 1000,
  "selling all removes holding and refunds",
);

// ── Bets ──
await q(`SELECT place_bet('market', 10, 'fit', 'up')`);
ok((await coins(A)) === 990, "market bet debits stake");
ok(
  /Not enough coins/.test((await fails(`SELECT place_bet('market', 5000, 'fit', 'up')`)) ?? ""),
  "cannot stake more than balance",
);
ok(
  /another player/.test(
    (await fails(`SELECT place_bet('duel', 5, NULL, NULL, NULL, '${A}')`)) ?? "",
  ),
  "cannot duel yourself",
);
await q(`SELECT place_bet('duel', 20, NULL, NULL, NULL, '${B}')`);
ok(
  (await q(`SELECT 1 FROM notifications WHERE user_id = $1 AND kind = 'duel'`, [B])).length === 0,
  "A cannot read B's notifications (RLS)",
);
ok(
  (await q(`SELECT count(*)::int AS n FROM resolve_due_bets()`))[0].n === 0,
  "nothing settles before it is due",
);

await db.exec(`RESET ROLE; UPDATE bets SET resolves_at = now() - interval '1 second';
               UPDATE market_assets SET price = price + 10 WHERE id = 'fit';
               UPDATE profiles SET total_steps = total_steps + 500 WHERE id = '${A}';`);
await as(A);
const settled = await q<{ bet_type: string; status: string }>(
  `SELECT bet_type, status FROM resolve_due_bets()`,
);
ok(
  settled.find((b) => b.bet_type === "market")?.status === "won",
  "market bet won after price rose",
);
ok(settled.find((b) => b.bet_type === "duel")?.status === "won", "duel won on more steps gained");
ok((await coins(A)) === 970 + 18 + 40, "winnings paid out (10*1.8 + 20*2)");
await as(B);
ok(
  (await q(`SELECT title FROM notifications WHERE user_id = $1 ORDER BY created_at`, [B]))
    .map((r) => r.title)
    .join(" | ") === "New step duel challenge | Step duel lost",
  "opponent notified of challenge and result",
);

// ── Check-ins: score = steps (max 40) + sleep band (5-20) + water (max 20) + workout 20 ──
await as(A);
const today = (await q<{ d: string }>(`SELECT ((now() AT TIME ZONE 'utc')::date)::text AS d`))[0].d;
for (const [steps, sleep, water, workout, expected] of [
  [12000, 8, 3.5, true, 100],
  [4321, 6.5, 1.2, false, 40],
  [0, 4, 0, false, 5],
  [9999, 10.5, 2.99, true, 90],
  [5000, 11.2, 20, false, 45],
] as const) {
  const sql = (
    await q<{ s: number }>(`SELECT calculate_activity_score($1, $2, $3, $4) AS s`, [
      steps,
      sleep,
      water,
      workout,
    ])
  )[0].s;
  ok(
    sql === expected,
    `score(${steps}, ${sleep}, ${water}, ${workout}) = ${sql}, expected ${expected}`,
  );
}
const before = await coins(A);
const r1 = (
  await q<{ r: { activity_score: number; total_coins: number; streak: number } }>(
    `SELECT submit_wellness_check_in($1::date, 8000, 8, 2, true, 4, 'good day') AS r`,
    [today],
  )
)[0].r;
// score 85 -> base 42.5 + day-1 streak bonus 0.5
const expected = 43;
ok(
  r1.streak === 1 && r1.activity_score === 85 && Math.abs(r1.total_coins - expected) < 1e-9,
  `check-in pays ${expected} coins`,
);
ok(Math.abs((await coins(A)) - (before + expected)) < 1e-9, "coins credited once");
const r2 = (
  await q<{ r: { total_coins: number } }>(
    `SELECT submit_wellness_check_in($1::date, 2000, 8, 2, true, 4, NULL) AS r`,
    [today],
  )
)[0].r;
ok(
  Math.abs((await coins(A)) - (before + r2.total_coins)) < 1e-9,
  "editing a check-in credits only the difference",
);
ok(
  /only be logged for today/.test(
    (await fails(`SELECT submit_wellness_check_in('2020-01-01', 1, 8, 1, false, 3)`)) ?? "",
  ),
  "cannot backfill old dates",
);
ok(
  /100,000/.test(
    (await fails(`SELECT submit_wellness_check_in($1::date, 999999, 8, 1, false, 3)`, [today])) ??
      "",
  ),
  "rejects absurd step counts",
);

// ── Streak + milestone ──
await db.exec(`RESET ROLE; INSERT INTO wellness_logs (user_id, date, steps, mood, activity_score, coins_earned)
  SELECT '${B}', ('${today}'::date - g), 1000, 3, 10, 5 FROM generate_series(1, 6) g;`);
await as(B);
const r3 = (
  await q<{ r: { streak: number; milestone_bonus: number } }>(
    `SELECT submit_wellness_check_in($1::date, 1000, 8, 1, false, 3) AS r`,
    [today],
  )
)[0].r;
ok(
  r3.streak === 7 && Number(r3.milestone_bonus) === 50,
  "7-day streak earns the 50-coin milestone",
);

// ── Market ticks ──
await db.exec(`RESET ROLE; UPDATE market_assets SET updated_at = now() - interval '10 seconds';`);
await as(A);
const p0 = await q(`SELECT id, price FROM market_assets ORDER BY id`);
await q(`SELECT tick_market()`);
const p1 = await q(`SELECT id, price, updated_at FROM market_assets ORDER BY id`);
await q(`SELECT tick_market()`);
const p2 = await q(`SELECT id, price, updated_at FROM market_assets ORDER BY id`);
ok(
  p1.some((r, i) => r.price !== p0[i].price) || p1.every((r) => r.updated_at !== null),
  "tick moves prices",
);
ok(JSON.stringify(p1) === JSON.stringify(p2), "second tick within 5s is a no-op");
ok(
  p1.every((r, i) => Math.abs(Number(r.price) / Number(p0[i].price) - 1) <= 0.02 + 1e-9),
  "each tick moves at most 2%",
);

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);

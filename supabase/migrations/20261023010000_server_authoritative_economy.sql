-- Server-authoritative economy: market prices, trades, bets and check-ins run in Postgres functions.
-- Clients can no longer write coins, holdings, bets or wellness rewards directly.

-- ─── Shared market prices ────────────────────────────────────────────────────
CREATE TABLE public.market_assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 1),
  change NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.market_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market assets readable by authenticated users"
  ON public.market_assets FOR SELECT TO authenticated USING (true);

INSERT INTO public.market_assets (id, name, ticker, description, price, change) VALUES
  ('hack', 'Hackathon Points', 'HACK', 'Index of competitive coding events', 142.5, 2.4),
  ('code', 'Coding Skill Index', 'CODE', 'Aggregate developer skill benchmark', 318.2, -0.8),
  ('fit', 'Fitness Index', 'FIT', 'Composite of global fitness activity', 87.6, 4.1),
  ('study', 'Study Hours Futures', 'STDY', 'Tracks collective study commitment', 56.3, 1.2),
  ('sleep', 'Sleep Quality ETF', 'SLP', 'Diversified rest & recovery basket', 204.9, -1.6);

-- Advances every price by one tick (±2% random drift plus 40% momentum) at most once per 5 seconds.
-- Open clients call it on an interval; the WHERE guard makes concurrent calls a no-op.
CREATE OR REPLACE FUNCTION public.tick_market()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH drift AS (
    SELECT id, GREATEST(1, round(price * (1 + (random()::NUMERIC - 0.5) * 0.04), 2)) AS new_price
    FROM public.market_assets
    WHERE updated_at <= now() - interval '5 seconds'
  )
  UPDATE public.market_assets m
  SET change = round(((d.new_price - m.price) / m.price) * 100 + m.change * 0.4, 2),
      price = d.new_price,
      updated_at = now()
  FROM drift d
  WHERE m.id = d.id AND m.updated_at <= now() - interval '5 seconds';
$$;

-- ─── Trades ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trade_asset(p_asset_id TEXT, p_side TEXT, p_shares NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_price NUMERIC;
  v_coins NUMERIC;
  v_held NUMERIC := 0;
  v_avg NUMERIC := 0;
  v_amount NUMERIC;
  v_after NUMERIC;
  v_new_avg NUMERIC;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF p_side NOT IN ('buy', 'sell') THEN
    RAISE EXCEPTION 'Side must be buy or sell';
  END IF;
  IF p_shares IS NULL OR p_shares <= 0 OR p_shares > 1000 THEN
    RAISE EXCEPTION 'Shares must be between 0 and 1000';
  END IF;

  SELECT price INTO v_price FROM public.market_assets WHERE id = p_asset_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown asset';
  END IF;

  -- Row locks serialize concurrent trades from the same user
  SELECT coins INTO v_coins FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  SELECT shares, avg_price INTO v_held, v_avg
  FROM public.holdings WHERE user_id = v_uid AND asset_id = p_asset_id FOR UPDATE;
  v_held := COALESCE(v_held, 0);
  v_avg := COALESCE(v_avg, 0);

  v_amount := round(v_price * p_shares, 2);

  IF p_side = 'buy' THEN
    IF v_coins < v_amount THEN
      RAISE EXCEPTION 'Not enough coins';
    END IF;
    v_after := v_held + p_shares;
    v_new_avg := (v_avg * v_held + v_price * p_shares) / v_after;
    INSERT INTO public.holdings (user_id, asset_id, shares, avg_price)
    VALUES (v_uid, p_asset_id, v_after, v_new_avg)
    ON CONFLICT (user_id, asset_id) DO UPDATE SET shares = EXCLUDED.shares, avg_price = EXCLUDED.avg_price;
    UPDATE public.profiles SET coins = coins - v_amount WHERE id = v_uid RETURNING coins INTO v_coins;
  ELSE
    IF v_held < p_shares THEN
      RAISE EXCEPTION 'Not enough shares';
    END IF;
    v_after := v_held - p_shares;
    v_new_avg := v_avg;
    IF v_after = 0 THEN
      DELETE FROM public.holdings WHERE user_id = v_uid AND asset_id = p_asset_id;
    ELSE
      UPDATE public.holdings SET shares = v_after WHERE user_id = v_uid AND asset_id = p_asset_id;
    END IF;
    UPDATE public.profiles SET coins = coins + v_amount WHERE id = v_uid RETURNING coins INTO v_coins;
  END IF;

  INSERT INTO public.asset_movements (user_id, asset_id, movement_type, shares, price, coins_delta, shares_after)
  VALUES (v_uid, p_asset_id, p_side, p_shares, v_price,
          CASE WHEN p_side = 'buy' THEN -v_amount ELSE v_amount END, v_after);

  RETURN json_build_object('price', v_price, 'coins', v_coins, 'shares_after', v_after, 'avg_price', v_new_avg);
END;
$$;

-- ─── Bets ────────────────────────────────────────────────────────────────────
ALTER TABLE public.bets ADD COLUMN opponent_start_steps INTEGER;

CREATE OR REPLACE FUNCTION public.place_bet(
  p_bet_type TEXT,
  p_stake NUMERIC,
  p_asset_id TEXT DEFAULT NULL,
  p_direction TEXT DEFAULT NULL,
  p_target_steps INTEGER DEFAULT NULL,
  p_opponent_id UUID DEFAULT NULL,
  p_resolves_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS public.bets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_opponent_steps INTEGER;
  v_price NUMERIC;
  v_bet public.bets%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF p_stake IS NULL OR p_stake <= 0 THEN
    RAISE EXCEPTION 'Stake must be greater than 0';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  IF v_profile.coins < p_stake THEN
    RAISE EXCEPTION 'Not enough coins';
  END IF;

  IF p_bet_type = 'market' THEN
    IF p_direction NOT IN ('up', 'down') THEN
      RAISE EXCEPTION 'Direction must be up or down';
    END IF;
    SELECT price INTO v_price FROM public.market_assets WHERE id = p_asset_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Unknown asset';
    END IF;
    INSERT INTO public.bets (user_id, bet_type, asset_id, direction, stake, payout_multiplier, start_price, resolves_at)
    VALUES (v_uid, 'market', p_asset_id, p_direction, p_stake, 1.8, v_price, now() + interval '60 seconds')
    RETURNING * INTO v_bet;

  ELSIF p_bet_type = 'goal' THEN
    IF p_target_steps IS NULL OR p_target_steps <= v_profile.steps_today OR p_target_steps > 100000 THEN
      RAISE EXCEPTION 'Step goal must be above your steps today and at most 100,000';
    END IF;
    -- The client sends its local midnight; clamp so a goal always runs for 1 minute to 24 hours
    INSERT INTO public.bets (user_id, bet_type, stake, payout_multiplier, target_value, start_steps, resolves_at)
    VALUES (v_uid, 'goal', p_stake, 2.0, p_target_steps, v_profile.steps_today,
            LEAST(GREATEST(COALESCE(p_resolves_at, now() + interval '24 hours'), now() + interval '1 minute'),
                  now() + interval '24 hours'))
    RETURNING * INTO v_bet;

  ELSIF p_bet_type = 'duel' THEN
    IF p_opponent_id IS NULL OR p_opponent_id = v_uid THEN
      RAISE EXCEPTION 'Pick another player to duel';
    END IF;
    SELECT total_steps INTO v_opponent_steps FROM public.profiles WHERE id = p_opponent_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Opponent not found';
    END IF;
    INSERT INTO public.bets (user_id, bet_type, stake, payout_multiplier, opponent_id, start_steps,
                             opponent_start_steps, resolves_at)
    VALUES (v_uid, 'duel', p_stake, 2.0, p_opponent_id, v_profile.total_steps, v_opponent_steps,
            now() + interval '24 hours')
    RETURNING * INTO v_bet;

  ELSE
    RAISE EXCEPTION 'Unknown bet type';
  END IF;

  UPDATE public.profiles SET coins = coins - p_stake WHERE id = v_uid;
  RETURN v_bet;
END;
$$;

-- Settles every due bet the caller is part of and pays out winners. Returns the settled bets.
CREATE OR REPLACE FUNCTION public.resolve_due_bets()
RETURNS SETOF public.bets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_bet public.bets%ROWTYPE;
  v_price NUMERIC;
  v_won BOOLEAN;
  v_user_steps INTEGER;
  v_user_total INTEGER;
  v_opp_total INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  FOR v_bet IN
    SELECT * FROM public.bets
    WHERE status = 'pending' AND resolves_at <= now() AND (user_id = v_uid OR opponent_id = v_uid)
    ORDER BY resolves_at
    FOR UPDATE SKIP LOCKED
  LOOP
    v_price := NULL;
    IF v_bet.bet_type = 'market' THEN
      SELECT price INTO v_price FROM public.market_assets WHERE id = v_bet.asset_id;
      v_won := CASE WHEN v_bet.direction = 'up' THEN v_price > v_bet.start_price
                    ELSE v_price < v_bet.start_price END;
    ELSIF v_bet.bet_type = 'goal' THEN
      SELECT steps_today INTO v_user_steps FROM public.profiles WHERE id = v_bet.user_id;
      v_won := v_user_steps >= v_bet.target_value;
    ELSE
      SELECT total_steps INTO v_user_total FROM public.profiles WHERE id = v_bet.user_id;
      SELECT total_steps INTO v_opp_total FROM public.profiles WHERE id = v_bet.opponent_id;
      -- Compare steps gained during the duel; duels from before opponent_start_steps compare totals
      v_won := (v_user_total - COALESCE(v_bet.start_steps, 0))
               >= (COALESCE(v_opp_total, 0) - COALESCE(v_bet.opponent_start_steps, v_bet.start_steps, 0));
    END IF;
    v_won := COALESCE(v_won, false);

    UPDATE public.bets
    SET status = CASE WHEN v_won THEN 'won' ELSE 'lost' END,
        resolved_at = now(),
        end_price = v_price
    WHERE id = v_bet.id
    RETURNING * INTO v_bet;

    IF v_won THEN
      UPDATE public.profiles
      SET coins = coins + round(v_bet.stake * v_bet.payout_multiplier, 2)
      WHERE id = v_bet.user_id;
    END IF;

    RETURN NEXT v_bet;
  END LOOP;
END;
$$;

-- ─── Wellness check-ins ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_activity_score(
  p_steps INTEGER, p_sleep NUMERIC, p_water NUMERIC, p_workout BOOLEAN
)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT round(
    LEAST(40, p_steps / 10000.0 * 40)
    + CASE
        WHEN p_sleep >= 7 AND p_sleep <= 9 THEN 20
        WHEN (p_sleep >= 6 AND p_sleep < 7) OR (p_sleep > 9 AND p_sleep <= 10) THEN 15
        WHEN (p_sleep >= 5 AND p_sleep < 6) OR (p_sleep > 10 AND p_sleep <= 11) THEN 10
        ELSE 5
      END
    + LEAST(20, p_water / 3.0 * 20)
    + CASE WHEN p_workout THEN 20 ELSE 0 END
  )::INTEGER;
$$;

-- Creates or updates the caller's check-in for p_date, computes score, streak and coins on the server,
-- and credits only the change in coins_earned so editing a check-in never double-pays.
CREATE OR REPLACE FUNCTION public.submit_wellness_check_in(
  p_date DATE,
  p_steps INTEGER,
  p_sleep NUMERIC,
  p_water NUMERIC,
  p_workout BOOLEAN,
  p_mood INTEGER,
  p_journal TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_existing public.wellness_logs%ROWTYPE;
  v_score INTEGER;
  v_streak INTEGER := 1;
  v_day DATE;
  v_base NUMERIC;
  v_streak_bonus NUMERIC;
  v_milestone NUMERIC;
  v_total NUMERIC;
  v_delta NUMERIC;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  -- The client sends its local date; allow one day either side of UTC for time zones
  IF p_date IS NULL OR p_date < (now() AT TIME ZONE 'utc')::DATE - 1
     OR p_date > (now() AT TIME ZONE 'utc')::DATE + 1 THEN
    RAISE EXCEPTION 'Check-ins can only be logged for today';
  END IF;
  IF p_steps IS NULL OR p_steps < 0 OR p_steps > 100000 THEN
    RAISE EXCEPTION 'Step count must be between 0 and 100,000';
  END IF;
  IF p_sleep IS NULL OR p_sleep < 0 OR p_sleep > 24 THEN
    RAISE EXCEPTION 'Sleep hours must be between 0 and 24';
  END IF;
  IF p_water IS NULL OR p_water < 0 OR p_water > 20 THEN
    RAISE EXCEPTION 'Water intake must be between 0 and 20 liters';
  END IF;
  IF p_mood IS NULL OR p_mood < 1 OR p_mood > 5 THEN
    RAISE EXCEPTION 'Mood must be between 1 and 5';
  END IF;
  IF length(p_journal) > 1000 THEN
    RAISE EXCEPTION 'Journal entry is too long';
  END IF;

  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  SELECT * INTO v_existing FROM public.wellness_logs WHERE user_id = v_uid AND date = p_date FOR UPDATE;

  v_day := p_date - 1;
  WHILE EXISTS (SELECT 1 FROM public.wellness_logs WHERE user_id = v_uid AND date = v_day) LOOP
    v_streak := v_streak + 1;
    v_day := v_day - 1;
  END LOOP;

  v_score := public.calculate_activity_score(p_steps, p_sleep, p_water, COALESCE(p_workout, false));
  v_base := round(v_score * 0.5, 2);
  v_streak_bonus := round(LEAST(10, v_streak * 0.5), 2);
  v_milestone := CASE v_streak WHEN 7 THEN 50 WHEN 14 THEN 100 WHEN 30 THEN 250 ELSE 0 END;
  v_total := v_base + v_streak_bonus + v_milestone;
  v_delta := v_total - COALESCE(v_existing.coins_earned, 0);

  INSERT INTO public.wellness_logs (user_id, date, steps, sleep, water, workout, mood, journal,
                                    activity_score, coins_earned)
  VALUES (v_uid, p_date, p_steps, p_sleep, p_water, COALESCE(p_workout, false), p_mood,
          NULLIF(trim(p_journal), ''), v_score, v_total)
  ON CONFLICT (user_id, date) DO UPDATE SET
    steps = EXCLUDED.steps, sleep = EXCLUDED.sleep, water = EXCLUDED.water, workout = EXCLUDED.workout,
    mood = EXCLUDED.mood, journal = EXCLUDED.journal, activity_score = EXCLUDED.activity_score,
    coins_earned = EXCLUDED.coins_earned;

  UPDATE public.profiles
  SET coins = coins + v_delta,
      steps_today = p_steps,
      total_steps = GREATEST(0, total_steps + p_steps - COALESCE(v_existing.steps, 0)),
      last_sync = now()
  WHERE id = v_uid;

  RETURN json_build_object(
    'activity_score', v_score,
    'streak', v_streak,
    'base_coins', v_base,
    'streak_bonus', v_streak_bonus,
    'milestone_bonus', v_milestone,
    'total_coins', v_total,
    'coin_delta', v_delta
  );
END;
$$;

-- ─── Lock down direct writes ─────────────────────────────────────────────────
-- Coins, holdings, bets, rewards and movement logs change only through the functions above.
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.holdings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.bets FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.wellness_logs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.asset_movements FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.market_assets FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.tick_market() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.trade_asset(TEXT, TEXT, NUMERIC) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.place_bet(TEXT, NUMERIC, TEXT, TEXT, INTEGER, UUID, TIMESTAMPTZ) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.resolve_due_bets() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_wellness_check_in(DATE, INTEGER, NUMERIC, NUMERIC, BOOLEAN, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tick_market() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trade_asset(TEXT, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_bet(TEXT, NUMERIC, TEXT, TEXT, INTEGER, UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_due_bets() TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_wellness_check_in(DATE, INTEGER, NUMERIC, NUMERIC, BOOLEAN, INTEGER, TEXT) TO authenticated;

-- Everyone sees the same live prices
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_assets;

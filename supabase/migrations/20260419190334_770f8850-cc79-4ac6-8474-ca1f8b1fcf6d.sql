-- Bets table for all 3 betting modes
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('market', 'duel', 'goal')),
  asset_id TEXT,
  direction TEXT CHECK (direction IN ('up', 'down')),
  stake NUMERIC NOT NULL CHECK (stake > 0),
  payout_multiplier NUMERIC NOT NULL DEFAULT 1.8,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  target_value INTEGER,
  start_price NUMERIC,
  end_price NUMERIC,
  start_steps INTEGER,
  opponent_id UUID,
  resolves_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bets_user ON public.bets(user_id);
CREATE INDEX idx_bets_status ON public.bets(status);
CREATE INDEX idx_bets_opponent ON public.bets(opponent_id);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bets or duels"
ON public.bets FOR SELECT TO authenticated
USING (auth.uid() = user_id OR auth.uid() = opponent_id);

CREATE POLICY "Users insert own bets"
ON public.bets FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own bets"
ON public.bets FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR auth.uid() = opponent_id);

CREATE TRIGGER update_bets_updated_at
BEFORE UPDATE ON public.bets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
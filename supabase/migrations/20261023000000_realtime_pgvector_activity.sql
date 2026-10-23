-- Realtime sync, pgvector semantic retrieval, asset movement logs and notifications

-- ─── pgvector knowledge base ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE public.knowledge_docs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  -- Gemini gemini-embedding-001 truncated to 768 dimensions
  embedding extensions.vector(768) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;

-- Readable by signed-in users; written only by the service role (scripts/embed-knowledge.ts)
CREATE POLICY "Knowledge docs readable by authenticated users"
  ON public.knowledge_docs FOR SELECT TO authenticated USING (true);

CREATE INDEX knowledge_docs_embedding_idx
  ON public.knowledge_docs USING hnsw (embedding extensions.vector_cosine_ops);

CREATE TRIGGER knowledge_docs_updated_at BEFORE UPDATE ON public.knowledge_docs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cosine-similarity search used by Pulse AI's retriever
CREATE OR REPLACE FUNCTION public.match_knowledge_docs(
  query_embedding extensions.vector(768),
  match_count INTEGER DEFAULT 3,
  min_similarity DOUBLE PRECISION DEFAULT 0.5
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  category TEXT,
  content TEXT,
  tags TEXT[],
  similarity DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT d.id, d.title, d.category, d.content, d.tags,
         1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_docs d
  WHERE 1 - (d.embedding <=> query_embedding) >= min_similarity
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── Asset movement log ──────────────────────────────────────────────────────
CREATE TABLE public.asset_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('buy', 'sell')),
  shares NUMERIC NOT NULL CHECK (shares > 0),
  price NUMERIC NOT NULL CHECK (price > 0),
  coins_delta NUMERIC NOT NULL,
  shares_after NUMERIC NOT NULL CHECK (shares_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_movements_user ON public.asset_movements(user_id, created_at DESC);

ALTER TABLE public.asset_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own asset movements"
  ON public.asset_movements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own asset movements"
  ON public.asset_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('trade', 'bet', 'duel', 'wellness')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- No INSERT policy: rows are written only by the SECURITY DEFINER triggers below
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─── Operational status triggers ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_asset_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, title, body)
  VALUES (
    NEW.user_id,
    'trade',
    CASE WHEN NEW.movement_type = 'buy' THEN 'Bought ' ELSE 'Sold ' END
      || trim_scale(NEW.shares) || ' ' || upper(NEW.asset_id),
    'Executed at ' || round(NEW.price, 2) || ' coins · '
      || CASE WHEN NEW.coins_delta >= 0 THEN '+' ELSE '' END || round(NEW.coins_delta, 2)
      || ' coins · ' || trim_scale(NEW.shares_after) || ' shares held'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER asset_movements_notify AFTER INSERT ON public.asset_movements
  FOR EACH ROW EXECUTE FUNCTION public.notify_asset_movement();

CREATE OR REPLACE FUNCTION public.notify_bet_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  label TEXT := CASE NEW.bet_type
    WHEN 'market' THEN 'Market bet' || COALESCE(' on ' || upper(NEW.asset_id), '')
    WHEN 'goal' THEN 'Step goal bet'
    ELSE 'Step duel'
  END;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.bet_type = 'duel' AND NEW.opponent_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, kind, title, body)
      VALUES (NEW.opponent_id, 'duel', 'New step duel challenge',
              'Someone staked ' || round(NEW.stake, 2) || ' coins on out-stepping you in 24h.');
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'pending' AND NEW.status IN ('won', 'lost', 'cancelled') THEN
    INSERT INTO public.notifications (user_id, kind, title, body)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.bet_type = 'duel' THEN 'duel' ELSE 'bet' END,
      label || ' ' || NEW.status,
      CASE NEW.status
        WHEN 'won' THEN 'Paid out ' || round(NEW.stake * NEW.payout_multiplier, 2) || ' coins.'
        WHEN 'lost' THEN 'Stake of ' || round(NEW.stake, 2) || ' coins lost.'
        ELSE 'Stake of ' || round(NEW.stake, 2) || ' coins cancelled.'
      END
    );
    IF NEW.bet_type = 'duel' AND NEW.opponent_id IS NOT NULL AND NEW.status <> 'cancelled' THEN
      INSERT INTO public.notifications (user_id, kind, title, body)
      VALUES (NEW.opponent_id, 'duel',
              'Step duel ' || CASE WHEN NEW.status = 'won' THEN 'lost' ELSE 'won' END,
              'Your duel for a ' || round(NEW.stake, 2) || '-coin stake has been settled.');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bets_notify_status AFTER INSERT OR UPDATE OF status ON public.bets
  FOR EACH ROW EXECUTE FUNCTION public.notify_bet_status();

CREATE OR REPLACE FUNCTION public.notify_wellness_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, title, body)
  VALUES (
    NEW.user_id,
    'wellness',
    CASE WHEN TG_OP = 'INSERT' THEN 'Check-in logged' ELSE 'Check-in updated' END,
    'Activity score ' || NEW.activity_score || ' · ' || round(NEW.coins_earned, 2)
      || ' coins earned for ' || NEW.date
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER wellness_logs_notify AFTER INSERT OR UPDATE ON public.wellness_logs
  FOR EACH ROW EXECUTE FUNCTION public.notify_wellness_log();

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- postgres_changes events respect each table's RLS policies
ALTER PUBLICATION supabase_realtime
  ADD TABLE public.profiles, public.holdings, public.bets, public.notifications, public.asset_movements;

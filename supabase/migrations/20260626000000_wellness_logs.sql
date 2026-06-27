-- Create wellness_logs table and configure Row Level Security (RLS)

CREATE TABLE public.wellness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  sleep NUMERIC NOT NULL DEFAULT 0,
  water NUMERIC NOT NULL DEFAULT 0,
  workout BOOLEAN NOT NULL DEFAULT FALSE,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  journal TEXT,
  activity_score INTEGER NOT NULL,
  coins_earned NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

-- Select policy: Users view their own wellness logs
CREATE POLICY "Users view own wellness logs"
  ON public.wellness_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Insert policy: Users insert their own wellness logs
CREATE POLICY "Users insert own wellness logs"
  ON public.wellness_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update policy: Users update their own wellness logs
CREATE POLICY "Users update own wellness logs"
  ON public.wellness_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Delete policy: Users delete their own wellness logs
CREATE POLICY "Users delete own wellness logs"
  ON public.wellness_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at column trigger
CREATE TRIGGER update_wellness_logs_updated_at
  BEFORE UPDATE ON public.wellness_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

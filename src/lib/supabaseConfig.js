// Supabase Environment Config
// Replace these with your actual Supabase project credentials
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/*
  SQL for setting up the expenses table in Supabase:

  -- Create expenses table
  CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('food', 'transport', 'rent', 'subscriptions', 'shopping', 'lifestyle', 'other')),
    note TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create index for faster queries
  CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
  CREATE INDEX idx_expenses_user_category ON expenses(user_id, category);

  -- Enable Row Level Security
  ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

  -- Policy: Users can only see their own data
  CREATE POLICY "Users can view own expenses"
    ON expenses FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own expenses"
    ON expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own expenses"
    ON expenses FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own expenses"
    ON expenses FOR DELETE
    USING (auth.uid() = user_id);

  -- Create streaks table
  CREATE TABLE daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
  );

  ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own logs"
    ON daily_logs FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own logs"
    ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
*/

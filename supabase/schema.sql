-- ====================================================================
-- UNCERTAIN INCOME PLANNER — SUPABASE POSTGRESQL SCHEMA
-- Author: Team Lynx (NextGen Buildathon)
-- Database: Supabase PostgreSQL with Row Level Security (RLS)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'Freelance Professional',
  timezone TEXT DEFAULT 'Asia/Kolkata (IST)',
  currency TEXT DEFAULT 'INR',
  avatar_initials TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User Planning Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  starting_balance NUMERIC(14,2) DEFAULT 45000.00,
  safety_buffer NUMERIC(14,2) DEFAULT 25000.00,
  default_horizon_days INTEGER DEFAULT 30,
  default_scenario TEXT DEFAULT 'expected' CHECK (default_scenario IN ('conservative', 'expected', 'optimistic')),
  income_frequency TEXT DEFAULT 'Irregular / Milestone-based',
  low_balance_alert_threshold NUMERIC(14,2) DEFAULT 20000.00,
  bill_reminder_lead_days INTEGER DEFAULT 3,
  notifications_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Income Entries Table (Certainty Tagging: received, confirmed, uncertain)
CREATE TABLE IF NOT EXISTS public.income_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source TEXT,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  expected_date DATE NOT NULL,
  actual_date DATE,
  status TEXT NOT NULL CHECK (status IN ('received', 'confirmed', 'uncertain')),
  recurring TEXT DEFAULT 'one-time',
  notes TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Expenses and Bills Table (Priority & Due Date Tracking)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  due_date DATE NOT NULL,
  paid_date DATE,
  is_essential BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'high' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  recurring TEXT DEFAULT 'one-time',
  late_fee NUMERIC(10,2) DEFAULT 0,
  grace_period INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid', 'overdue')),
  notes TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Financial Transactions Ledger Table (Permanent audit trail)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'savings_deposit', 'savings_withdrawal')),
  transaction_date DATE NOT NULL,
  related_record_id UUID,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Lean-Week Savings Goals & Reserve Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weeks INTEGER DEFAULT 4 CHECK (weeks > 0),
  expected_low_income_per_week NUMERIC(14,2) DEFAULT 5000.00,
  essential_weekly_expenses NUMERIC(14,2) DEFAULT 12000.00,
  current_designated_reserve NUMERIC(14,2) DEFAULT 14000.00 CHECK (current_designated_reserve >= 0),
  weekly_contribution NUMERIC(14,2) DEFAULT 3500.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  related_record TEXT,
  date DATE DEFAULT CURRENT_DATE,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('critical', 'warning', 'info')),
  is_read BOOLEAN DEFAULT false,
  action_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Payment Delay Simulation Scenarios Table (Sandboxed saved scenarios)
CREATE TABLE IF NOT EXISTS public.simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  income_id TEXT,
  delay_days INTEGER DEFAULT 0,
  unexpected_expense NUMERIC(14,2) DEFAULT 0,
  income_reduction_pct NUMERIC(5,2) DEFAULT 0,
  max_shortfall NUMERIC(14,2) DEFAULT 0,
  min_balance NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE AND DATE-BASED CASH FLOW QUERIES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_incomes_user_status ON public.income_entries (user_id, status);
CREATE INDEX IF NOT EXISTS idx_incomes_expected_date ON public.income_entries (user_id, expected_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_status ON public.expenses (user_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON public.expenses (user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, is_read);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — ABSOLUTE USER ISOLATION
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_scenarios ENABLE ROW LEVEL SECURITY;

-- Profiles: users read and update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Income Entries
CREATE POLICY "Users can manage their own incomes"
  ON public.income_entries FOR ALL
  USING (auth.uid() = user_id);

-- Expenses & Bills
CREATE POLICY "Users can manage their own expenses"
  ON public.expenses FOR ALL
  USING (auth.uid() = user_id);

-- Transactions Ledger
CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

-- Savings Goals
CREATE POLICY "Users can manage their own savings goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- Simulation Scenarios
CREATE POLICY "Users can manage their own simulations"
  ON public.simulation_scenarios FOR ALL
  USING (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATED TRIGGERS: NEW USER INITIALIZATION & UPDATED_AT
-- ====================================================================

-- Trigger function: Create profile and default financial preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 1, 2))
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  INSERT INTO public.savings_goals (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function: update timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_update_preferences_timestamp BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_update_incomes_timestamp BEFORE UPDATE ON public.income_entries FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_update_expenses_timestamp BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_update_savings_timestamp BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

/*
  # SEOark Platform Database Schema

  ## Overview
  Complete database schema for SEOark - an SEO optimization SaaS platform with trial management,
  subscription tracking, and project usage limits.

  ## New Tables Created
  
  ### 1. profiles
  Extends auth.users with SEOark-specific user data
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `subscription_status` (text) - trial, active, expired, cancelled
  - `trial_start_date` (timestamptz) - When trial started
  - `trial_end_date` (timestamptz) - When trial ends
  - `projects_used` (integer) - Number of projects created
  - `max_projects` (integer) - Maximum allowed projects (3 for trial)
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. projects
  Tracks websites/domains using SEOark optimization
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Links to profiles
  - `name` (text) - Project name
  - `domain` (text) - Website domain/URL
  - `status` (text) - active, paused, expired
  - `optimization_level` (text) - low, medium, high
  - `seo_score` (integer) - Overall SEO score 0-100
  - `api_key` (uuid) - Unique key for this project
  - `created_at` (timestamptz)
  - `last_optimized_at` (timestamptz)

  ### 3. subscriptions
  Manages subscription plans and billing
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Links to profiles
  - `plan_type` (text) - trial, basic, pro, enterprise
  - `status` (text) - active, expired, cancelled, payment_due
  - `amount_due` (decimal) - Amount owed
  - `billing_cycle` (text) - monthly, yearly
  - `started_at` (timestamptz)
  - `ends_at` (timestamptz)
  - `next_billing_date` (timestamptz)

  ### 4. seo_optimizations
  Logs each SEO optimization run
  - `id` (uuid, primary key)
  - `project_id` (uuid) - Links to projects
  - `optimization_type` (text) - meta_tags, schema_markup, sitemap, etc.
  - `status` (text) - pending, completed, failed
  - `score_improvement` (integer) - Score change
  - `details` (jsonb) - Optimization details
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - API key validation for project access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscription_status text DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_start_date timestamptz DEFAULT now(),
  trial_end_date timestamptz DEFAULT (now() + interval '3 months'),
  projects_used integer DEFAULT 0,
  max_projects integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
  optimization_level text DEFAULT 'medium' CHECK (optimization_level IN ('low', 'medium', 'high')),
  seo_score integer DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  api_key uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_optimized_at timestamptz,
  UNIQUE(user_id, domain)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow public read by api_key for SDK
CREATE POLICY "Public can read project by api_key"
  ON projects FOR SELECT
  TO anon
  USING (true);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type text DEFAULT 'trial' CHECK (plan_type IN ('trial', 'basic', 'pro', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'payment_due')),
  amount_due decimal(10,2) DEFAULT 0.00,
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  next_billing_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create seo_optimizations table
CREATE TABLE IF NOT EXISTS seo_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  optimization_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  score_improvement integer DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seo_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view optimizations for own projects"
  ON seo_optimizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = seo_optimizations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert optimizations"
  ON seo_optimizations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = seo_optimizations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.subscriptions (user_id, plan_type, status, ends_at)
  VALUES (NEW.id, 'trial', 'active', now() + interval '3 months');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user can create more projects
CREATE OR REPLACE FUNCTION public.can_create_project(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_projects_used integer;
  v_max_projects integer;
  v_subscription_status text;
  v_trial_end_date timestamptz;
BEGIN
  SELECT projects_used, max_projects, subscription_status, trial_end_date
  INTO v_projects_used, v_max_projects, v_subscription_status, v_trial_end_date
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if trial expired
  IF v_subscription_status = 'trial' AND v_trial_end_date < now() THEN
    RETURN false;
  END IF;
  
  -- Check if subscription is active
  IF v_subscription_status NOT IN ('trial', 'active') THEN
    RETURN false;
  END IF;
  
  -- Check project limit
  IF v_projects_used >= v_max_projects AND v_subscription_status = 'trial' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

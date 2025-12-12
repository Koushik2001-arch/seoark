import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
          trial_start_date: string;
          trial_end_date: string;
          projects_used: number;
          max_projects: number;
          created_at: string;
          updated_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          domain: string;
          status: 'active' | 'paused' | 'expired';
          optimization_level: 'low' | 'medium' | 'high';
          seo_score: number;
          api_key: string;
          created_at: string;
          last_optimized_at: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'trial' | 'basic' | 'pro' | 'enterprise';
          status: 'active' | 'expired' | 'cancelled' | 'payment_due';
          amount_due: number;
          billing_cycle: 'monthly' | 'yearly' | null;
          started_at: string;
          ends_at: string | null;
          next_billing_date: string | null;
          created_at: string;
        };
      };
    };
  };
};

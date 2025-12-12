/*
  # Add helper function to increment projects used

  ## Changes
  1. Creates function to increment projects_used counter
  2. Ensures atomic updates to prevent race conditions
*/

CREATE OR REPLACE FUNCTION public.increment_projects_used(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET projects_used = projects_used + 1,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

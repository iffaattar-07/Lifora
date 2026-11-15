-- ====================================================================
-- LIFORA: Production Row-Level Security (RLS) & Security Definer Functions
-- Optimized for Supabase PostgreSQL & Realtime Subscriptions
-- ====================================================================

-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- 2. SECURITY DEFINER HELPER FUNCTIONS

-- Helper A: Get all elderly user UUIDs accessible by the authenticated user
CREATE OR REPLACE FUNCTION public.accessible_elderly_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
    -- Case 1: The authenticated user is themselves an elderly care recipient
    SELECT auth.uid()
    UNION
    -- Case 2: The authenticated user is an accepted member of the elderly person's care circle
    SELECT elderly_user_id 
    FROM public.care_circle_members
    WHERE member_user_id = auth.uid() 
      AND invite_status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper B: Check if authenticated user can modify medication regimens for an elderly patient
CREATE OR REPLACE FUNCTION public.can_manage_medications(target_elderly_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Senior can always manage their own medications
  IF target_elderly_id = auth.uid() THEN
    RETURN TRUE;
  END IF;

  -- Care circle member can manage if authorized
  RETURN EXISTS (
    SELECT 1 
    FROM public.care_circle_members
    WHERE elderly_user_id = target_elderly_id 
      AND member_user_id = auth.uid()
      AND can_manage_meds = TRUE
      AND invite_status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- --------------------------------------------------------------------

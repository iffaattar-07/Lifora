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
-- 3. POLICIES: PROFILES TABLE
-- --------------------------------------------------------------------

-- User can select their own profile OR profiles of members in their connected circle
CREATE POLICY "Profiles view policy"
ON public.profiles FOR SELECT
USING (
  id = auth.uid() OR
  id IN (SELECT public.accessible_elderly_ids()) OR
  EXISTS (
    SELECT 1 FROM public.care_circle_members ccm
    WHERE ccm.member_user_id = public.profiles.id
      AND ccm.elderly_user_id = auth.uid()
  )
);

-- User can update their own profile
CREATE POLICY "Profiles update own policy"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Initial profile creation during signup
CREATE POLICY "Profiles insert policy"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------
-- 4. POLICIES: MEDICATIONS TABLE
-- --------------------------------------------------------------------

-- Select: Patient and authorized care circle can view prescriptions
CREATE POLICY "Medications select policy"
ON public.medications FOR SELECT
USING (user_id IN (SELECT public.accessible_elderly_ids()));

-- Insert: Patient or authorized caregiver can add new medication
CREATE POLICY "Medications insert policy"
ON public.medications FOR INSERT
WITH CHECK (public.can_manage_medications(user_id));

-- Update: Patient or authorized caregiver can edit medications
CREATE POLICY "Medications update policy"
ON public.medications FOR UPDATE
USING (public.can_manage_medications(user_id))
WITH CHECK (public.can_manage_medications(user_id));

-- Delete: Patient or authorized caregiver can remove medications
CREATE POLICY "Medications delete policy"
ON public.medications FOR DELETE
USING (public.can_manage_medications(user_id));

-- --------------------------------------------------------------------
-- 5. POLICIES: DOSE LOGS TABLE
-- --------------------------------------------------------------------

-- Select: Patient and care circle can view daily doses
CREATE POLICY "Dose logs select policy"
ON public.dose_logs FOR SELECT
USING (user_id IN (SELECT public.accessible_elderly_ids()));

-- Insert: Automated system or authorized care circle can insert dose slots
CREATE POLICY "Dose logs insert policy"
ON public.dose_logs FOR INSERT
WITH CHECK (user_id IN (SELECT public.accessible_elderly_ids()));

-- Update: Patient or caregiver can mark doses as taken/missed/snoozed
CREATE POLICY "Dose logs update policy"
ON public.dose_logs FOR UPDATE
USING (user_id IN (SELECT public.accessible_elderly_ids()))
WITH CHECK (user_id IN (SELECT public.accessible_elderly_ids()));

-- --------------------------------------------------------------------
-- 6. POLICIES: CARE CIRCLE MEMBERS TABLE
-- --------------------------------------------------------------------

-- Select: Patient and members of the same care circle can view members
CREATE POLICY "Care circle select policy"
ON public.care_circle_members FOR SELECT
USING (
  elderly_user_id = auth.uid() OR
  member_user_id = auth.uid() OR
  elderly_user_id IN (SELECT public.accessible_elderly_ids())
);

-- Insert: Elderly patient or family admin can invite new members
CREATE POLICY "Care circle insert policy"
ON public.care_circle_members FOR INSERT
WITH CHECK (
  elderly_user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.care_circle_members ccm
    WHERE ccm.elderly_user_id = care_circle_members.elderly_user_id
      AND ccm.member_user_id = auth.uid()
      AND ccm.role = 'family'
  )
);

-- Update: Elderly or member themselves can update permissions / invite status
CREATE POLICY "Care circle update policy"
ON public.care_circle_members FOR UPDATE
USING (
  elderly_user_id = auth.uid() OR
  member_user_id = auth.uid()
);

-- Delete: Elderly or member can unlink membership
CREATE POLICY "Care circle delete policy"
ON public.care_circle_members FOR DELETE
USING (
  elderly_user_id = auth.uid() OR
  member_user_id = auth.uid()
);

-- --------------------------------------------------------------------
-- 7. POLICIES: APPOINTMENTS TABLE
-- --------------------------------------------------------------------

-- Select: Patient and care circle can view appointments
CREATE POLICY "Appointments select policy"
ON public.appointments FOR SELECT
USING (user_id IN (SELECT public.accessible_elderly_ids()));

-- Insert / Update / Delete: Patient and care circle can coordinate visits
CREATE POLICY "Appointments modify policy"
ON public.appointments FOR ALL
USING (user_id IN (SELECT public.accessible_elderly_ids()))
WITH CHECK (user_id IN (SELECT public.accessible_elderly_ids()));

-- --------------------------------------------------------------------
